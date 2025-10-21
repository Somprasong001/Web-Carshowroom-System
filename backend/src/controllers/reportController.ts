import { Response, NextFunction } from 'express';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';
import { AuthenticatedRequest } from '../types';

export const getUserActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const [logs] = await db.query<RowDataPacket[]>(
      "SELECT DATE(login_at) as date, COUNT(*) as count " +
      "FROM login_logs " +
      "WHERE login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
      "GROUP BY DATE(login_at) " +
      "ORDER BY date DESC"
    );

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    res.status(500).json({ error: 'Failed to generate user activity report' });
  }
};

export const getRegistrationTrends = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const [trends] = await db.query<RowDataPacket[]>(
      "SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count " +
      "FROM users " +
      "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
      "GROUP BY DATE_FORMAT(created_at, '%Y-%m') " +
      "ORDER BY date DESC"
    );

    res.status(200).json(trends);
  } catch (error) {
    console.error('Error in getRegistrationTrends:', error);
    res.status(500).json({ error: 'Failed to generate registration trends report' });
  }
};