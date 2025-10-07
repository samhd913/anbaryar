import mysql from 'mysql2/promise';

class DatabaseService {
  private connection: mysql.Connection | null = null;

  async connect() {
    if (this.connection) {
      return this.connection;
    }

    try {
      this.connection = await mysql.createConnection({
        host: process.env.MYSQLHOST || 'mysql.railway.internal',
        port: parseInt(process.env.MYSQLPORT || '3306'),
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || 'railway',
        ssl: {
          rejectUnauthorized: false
        }
      });

      console.log('Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async query(sql: string, params?: any[]) {
    if (!this.connection) {
      await this.connect();
    }
    
    const [rows] = await this.connection!.execute(sql, params);
    return rows;
  }

  async createUsersTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await this.query(sql);
    console.log('Users table created/verified');
  }

  async createUser(username: string, email: string, password: string, role: string = 'user') {
    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await this.query(sql, [username, email, password, role]) as any;
    return result.insertId;
  }

  async getUserByUsername(username: string) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await this.query(sql, [username]) as any;
    return rows[0];
  }

  async getUserByEmail(email: string) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await this.query(sql, [email]) as any;
    return rows[0];
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

export default new DatabaseService();
