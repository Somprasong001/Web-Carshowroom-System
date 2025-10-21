import { Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { AuthenticatedRequest, User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // ดึง token จาก Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header provided' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // ตรวจสอบ token
    jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        console.error('[authMiddleware] Token verification error:', err.message);
        
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({ 
            error: 'Token expired', 
            details: 'Please login again' 
          });
          return;
        }
        
        if (err.name === 'JsonWebTokenError') {
          res.status(401).json({ 
            error: 'Invalid token', 
            details: err.message 
          });
          return;
        }
        
        res.status(401).json({ 
          error: 'Token verification failed', 
          details: err.message 
        });
        return;
      }

      try {
        // ตรวจสอบข้อมูลใน token
        if (!decoded || typeof decoded !== 'object') {
          throw new Error('Invalid token payload');
        }

        if (typeof decoded.id !== 'number') {
          throw new Error('User ID is required in token');
        }

        if (typeof decoded.role !== 'string' || !['client', 'admin'].includes(decoded.role)) {
          throw new Error('Invalid role in token');
        }

        // สร้าง user object และเพิ่มใน request
        const user: User = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role as 'client' | 'admin',
          iat: decoded.iat,
          exp: decoded.exp,
        };

        req.user = user;
        
        console.log(`[authMiddleware] User authenticated: ${user.id} (${user.role})`);
        next();
      } catch (error) {
        console.error('[authMiddleware] Payload validation error:', error);
        res.status(401).json({
          error: 'Invalid token payload',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  } catch (error) {
    console.error('[authMiddleware] Unexpected error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (req.user.role !== 'admin') {
      console.log(`[adminMiddleware] Access denied for user ${req.user.id} (${req.user.role})`);
      res.status(403).json({ 
        error: 'Access denied', 
        details: 'Admin privileges required' 
      });
      return;
    }

    console.log(`[adminMiddleware] Admin access granted: ${req.user.id}`);
    next();
  } catch (error) {
    console.error('[adminMiddleware] Error:', error);
    res.status(500).json({
      error: 'Authorization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};