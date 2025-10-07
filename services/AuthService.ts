import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import DatabaseService from './DatabaseService';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private JWT_EXPIRES_IN = '7d';

  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByUsername(data.username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      const existingEmail = await DatabaseService.getUserByEmail(data.email);
      if (existingEmail) {
        return { success: false, message: 'Email already exists' };
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const userId = await DatabaseService.createUser(
        data.username,
        data.email,
        hashedPassword
      );

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: userId,
          username: data.username,
          email: data.email,
          role: 'user'
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; token?: string; user?: User }> {
    try {
      // Get user from database
      const user = await DatabaseService.getUserByUsername(credentials.username);
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async verifyToken(token: string): Promise<{ success: boolean; user?: User }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        success: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
          email: '', // Not included in token for security
          role: decoded.role
        }
      };
    } catch (error) {
      return { success: false };
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await DatabaseService.getUserByUsername(credentials.username);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await DatabaseService.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Password change failed' };
    }
  }
}

export default new AuthService();
