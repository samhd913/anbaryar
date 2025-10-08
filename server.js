const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for now
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use((req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      req.cookies[name] = value;
    });
  }
  next();
});

// Database connection
let db = null;

async function connectDB() {
  try {
    console.log('Database connection config:', {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      database: process.env.PGDATABASE,
      hasPassword: !!process.env.PGPASSWORD
    });

    // Check if we have all required environment variables
    if (!process.env.PGHOST || !process.env.PGPASSWORD) {
      console.log('Missing database environment variables, starting without database...');
      console.log('To setup PostgreSQL database:');
      console.log('1. Go to Railway Dashboard');
      console.log('2. Add PostgreSQL service');
      console.log('3. Add environment variables: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE');
      return;
    }

    db = new Pool({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'railway',
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    const client = await db.connect();
    client.release();
    
    console.log('Database connected successfully');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Users table created/verified');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Starting server without database...');
    console.log('Database will be available after PostgreSQL setup in Railway');
    db = null;
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Not connected',
    version: '1.0.0',
    setup: {
      database: !db ? 'PostgreSQL database not configured. Add PostgreSQL service in Railway Dashboard.' : 'Database ready',
      environment: {
        PGHOST: process.env.PGHOST ? 'Set' : 'Missing',
        PGPASSWORD: process.env.PGPASSWORD ? 'Set' : 'Missing',
        PGDATABASE: process.env.PGDATABASE ? 'Set' : 'Missing'
      }
    }
  });
});

// API Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!db) {
      // Temporary: Allow registration without database
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username, email and password are required' 
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }
      
      // Generate temporary token
      const token = jwt.sign(
        { 
          userId: 1, 
          username: username, 
          role: 'user' 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully (temporary)',
        token,
        user: {
          id: 1,
          username,
          email,
          role: 'user'
        }
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!db) {
      // Temporary: Allow login without database
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }
      
      // Simple validation (in real app, check against database)
      if (username.length < 3 || password.length < 6) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Generate temporary token
      const token = jwt.sign(
        { 
          userId: 1, 
          username: username, 
          role: 'user' 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      return res.json({
        success: true,
        message: 'Login successful (temporary)',
        token,
        user: {
          id: 1,
          username,
          email: username + '@example.com',
          role: 'user'
        }
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Get user from database
    const users = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (users.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old and new passwords are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Get user from database
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = users[0];

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Password change failed' 
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware for protected routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Serve auth page for unauthenticated users
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

// Handle client-side routing - catch all non-API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip auth page
  if (req.path === '/auth') {
    return next();
  }
  
  // Check if user is authenticated
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.redirect('/auth');
  }
  
  // Verify token
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    res.clearCookie('authToken');
    return res.redirect('/auth');
  }
  
  // Serve simple index.html for authenticated users
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
