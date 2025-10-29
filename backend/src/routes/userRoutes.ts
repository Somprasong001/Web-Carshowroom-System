import { Router, Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import db from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs'; // 👈 เพิ่ม import bcrypt

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
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 👇 เพิ่ม: Get single user by ID (admin only)
router.get('/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('[GET /api/users/:userId] Error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get admin email (admin only)
router.get('/admin-email', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const [admins] = await db.query<RowDataPacket[]>('SELECT email FROM users WHERE role = "admin" LIMIT 1');
    if (admins.length > 0) {
      res.status(200).json({ email: admins[0].email });
    } else {
      res.status(200).json({ email: 'admin@example.com' });
    }
  } catch (error) {
    console.error('[GET /api/users/admin-email] Error:', error);
    res.status(200).json({ email: 'admin@example.com' });
  }
});

// 👇 ปรับปรุง: Create new user (admin only) - เพิ่มการ hash password
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, status } = req.body;
  
  // Validation
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    // Hash password ด้วย bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user ใหม่
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, role, status || 1]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'User created successfully' 
    });
  } catch (error: any) {
    console.error('[POST /api/users] Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 👇 เพิ่ม: Update user (admin only)
router.put('/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !role) {
      res.status(400).json({ error: 'Name, email, and role are required' });
      return;
    }

    // ตรวจสอบว่า email ซ้ำกับ user อื่นหรือไม่
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Email is already in use by another user' });
      return;
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE users SET name = ?, email = ?, role = ?';
    let params: any[] = [name, email, role];

    // เฉพาะถ้ามีการเปลี่ยน password
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await db.query(updateQuery, params);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('[PUT /api/users/:userId] Error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email is already in use' });
      return;
    }
    
    res.status(500).json({ error: 'Failed to update user' });
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