import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';
import { User, AuthenticatedRequest } from '../types';

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: 'client' | 'admin';
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhdwMy])$/);
  if (!match) {
    return 3600;
  }

  const num = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    case 'w': return num * 604800;
    case 'M': return num * 2592000;
    case 'y': return num * 31536000;
    default: return 3600;
  }
}

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const userRole: 'client' | 'admin' = role && ['admin', 'client'].includes(role) ? role : 'client';

  try {
    const [existingUsers] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query('INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 1, NOW())', [name, email, hashedPassword, userRole]);
    const userId = (result as any).insertId;

    const [newUser] = await db.query<(RowDataPacket & User)[]>('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
    if (newUser.length === 0) {
      res.status(500).json({ error: 'Failed to retrieve newly registered user' });
      return;
    }

    const user = newUser[0];
    const token = generateJwtToken(user);

    await db.query('INSERT INTO login_logs (user_id, role, login_at) VALUES (?, ?, NOW())', [user.id, user.role]);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [users] = await db.query<(RowDataPacket & User)[]>('SELECT id, name, email, role, password, created_at FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = users[0];
    if (!user.password) {
      res.status(500).json({ error: 'User password is not defined' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateJwtToken(user);

    await db.query('INSERT INTO login_logs (user_id, role, login_at) VALUES (?, ?, NOW())', [user.id, user.role]);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getDashboardData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const [registerData] = await db.query<RowDataPacket[]>(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE role = 'client' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7"
    );
    const [loginData] = await db.query<RowDataPacket[]>(
      "SELECT DATE(login_at) as date, COUNT(*) as count FROM login_logs WHERE role = 'client' GROUP BY DATE(login_at) ORDER BY date DESC LIMIT 7"
    );
    const [totalRegisters] = await db.query<RowDataPacket[]>("SELECT COUNT(*) as total FROM users WHERE role = 'client'");
    const [totalLogins] = await db.query<RowDataPacket[]>("SELECT COUNT(*) as total FROM login_logs WHERE role = 'client'");

    const dashboardData = {
      registerData: registerData.map(row => ({ date: row.date, count: row.count })),
      loginData: loginData.map(row => ({ date: row.date, count: row.count })),
      totalRegisters: totalRegisters[0].total,
      totalLogins: totalLogins[0].total,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getRecentActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [logs] = await db.query<RowDataPacket[]>(
      'SELECT users.name, login_logs.role, login_logs.login_at FROM login_logs JOIN users ON login_logs.user_id = users.id ORDER BY login_logs.login_at DESC LIMIT 3'
    );
    const activities = logs.map(log => ({
      message: `User ${log.name} (${log.role}) logged in`,
      timestamp: log.login_at,
    }));
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

function generateJwtToken(user: User): string {
  let expiresIn: number = 3600;
  if (process.env.JWT_EXPIRES_IN) {
    const envExpiresIn = process.env.JWT_EXPIRES_IN;
    if (!isNaN(Number(envExpiresIn))) {
      expiresIn = Number(envExpiresIn);
    } else if (/^\d+[smhdwMy]$/.test(envExpiresIn)) {
      expiresIn = parseExpiresIn(envExpiresIn);
    } else {
      console.warn('Invalid JWT_EXPIRES_IN format, using default 3600 seconds');
    }
  }

  const signOptions: SignOptions = { expiresIn };
  
  // ✅ ระบุ role เป็น literal type
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role as 'client' | 'admin'  // ✅ แก้ตรงนี้
    }, 
    JWT_SECRET as string, 
    signOptions
  );
}