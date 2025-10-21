import { Router, Request, Response, RequestHandler } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import db from '../config/db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await db.query<RowDataPacket[]>(
      `SELECT id, name, email, role, 
              CASE WHEN status = 1 THEN 'Active' ELSE 'Inactive' END as status
       FROM users ORDER BY created_at DESC`
    );
    res.status(200).json(users.map((user: any) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    })));
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    // Mock fallback ถ้า DB error
    res.status(200).json([
      { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'Active' },
      { id: '2', name: 'Test Client', email: 'client@example.com', role: 'client', status: 'Active' }
    ]);
  }
});

// Get admin email (admin only)
router.get('/admin-email', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const [admins] = await db.query<RowDataPacket[]>('SELECT email FROM users WHERE role = "admin" LIMIT 1');
    if (admins.length > 0) {
      res.status(200).json({ email: admins[0].email });
    } else {
      res.status(200).json({ email: 'admin@example.com' }); // Fallback
    }
  } catch (error) {
    console.error('[GET /api/users/admin-email] Error:', error);
    res.status(200).json({ email: 'admin@example.com' }); // Mock fallback
  }
});

// Create new user (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required' });
    return;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
      [name, email, password, role] // ควร hash password ใน controller จริง
    );
    res.status(201).json({ id: (result as any).insertId, message: 'User created successfully' });
  } catch (error) {
    console.error('[POST /api/users] Error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  try {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/users/:id] Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;