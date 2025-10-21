import { Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { WebSocketServer, WebSocket } from 'ws';
import db from '../config/db';
import { Contact, AuthenticatedRequest } from '../types';
import { RowDataPacket } from 'mysql2';
import path from 'path';
import fs from 'fs';

// สร้าง WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// เก็บการเชื่อมต่อของ Admin
const adminConnections: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');
  adminConnections.add(ws);

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    adminConnections.delete(ws);
  });
});

// ส่งการแจ้งเตือนไปยัง Admin ผ่าน WebSocket
const notifyAdmins = (message: string) => {
  adminConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'notification', message }));
    }
  });
};

// ตั้งค่า Nodemailer (จะใช้เฉพาะถ้าไม่ปิดการส่งอีเมล)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ตรวจสอบ environment variables เฉพาะเมื่อไม่ปิดการส่งอีเมล
const isEmailDisabled = process.env.DISABLE_EMAIL === 'true';
if (!isEmailDisabled) {
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_ADMIN'];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

export const sendContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { name, email, message } = req.body;
    const file = req.file;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const filePath = file ? `/uploads/${file.filename}` : null;
    await db.query(
      'INSERT INTO contacts (user_id, name, email, message, file_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [req.user.id, name, email, message, filePath]
    );

    if (!isEmailDisabled) {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_ADMIN!,
        subject: `New Contact Message from ${name}`,
        text: `
          Name: ${name}
          Email: ${email}
          Message: ${message}
          ${filePath ? `Attachment: ${filePath}` : ''}
        `,
        attachments: file
          ? [
              {
                filename: file.filename,
                path: path.join(__dirname, '../../uploads', file.filename),
              },
            ]
          : undefined,
      };

      await transporter.sendMail(mailOptions);
    }
    notifyAdmins(`New contact message from ${name}: ${message}`);

    res.status(200).json({ message: 'Contact message sent successfully' });
  } catch (error) {
    console.error('Error in sendContact:', error);
    res.status(500).json({ error: 'Failed to send contact message', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getContacts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }

  try {
    const [rows] = await db.query<(RowDataPacket & Contact)[]>('SELECT * FROM contacts ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in getContacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const replyContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }

  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!id || !reply) {
      res.status(400).json({ error: 'ID and reply message are required' });
      return;
    }

    const [contact] = await db.query<(RowDataPacket & Contact)[]>('SELECT * FROM contacts WHERE id = ?', [id]);
    if (contact.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    if (!isEmailDisabled) {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Admin" <${process.env.EMAIL_USER}>`,
        to: contact[0].email,
        subject: `Re: Your Message from ${contact[0].name}`,
        text: `Dear ${contact[0].name},\n\n${reply}\n\nBest regards,\nAdmin`,
      };

      await transporter.sendMail(mailOptions);
    }
    await db.query('UPDATE contacts SET status = ? WHERE id = ?', ['replied', id]);
    notifyAdmins(`Replied to contact message from ${contact[0].name}`);

    res.status(200).json({ message: 'Contact replied successfully' });
  } catch (error) {
    console.error('Error in replyContact:', error);
    res.status(500).json({ error: 'Failed to reply to contact', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }

  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID is required' });
      return;
    }

    const [contact] = await db.query<(RowDataPacket & Contact)[]>('SELECT file_name FROM contacts WHERE id = ?', [id]);
    if (contact.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    if (contact[0].file_name) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(contact[0].file_name));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error in deleteContact:', error);
    res.status(500).json({ error: 'Failed to delete contact', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};