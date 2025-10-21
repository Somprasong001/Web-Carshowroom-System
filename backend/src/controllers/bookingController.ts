import { RequestHandler, Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { Booking } from '../types';
import { JwtPayload } from 'jsonwebtoken';

// กำหนด interface สำหรับ req.user โดยระบุ role เป็น union type ที่ชัดเจน
interface CustomRequest extends Request {
    user?: JwtPayload & { id: number; role: 'client' | 'admin' };
}

export const createBooking: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const booking: Booking = req.body;
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    if (!booking.carId || !booking.bookingDate || !booking.type) {
        res.status(400).json({ error: 'Car ID, booking date, and type are required' });
        return;
    }

    const validTypes = ['test_drive', 'inquiry'];
    if (!validTypes.includes(booking.type)) {
        res.status(400).json({ error: `Invalid type. Type must be one of: ${validTypes.join(', ')}` });
        return;
    }

    try {
        const [cars] = await db.query("SELECT * FROM cars WHERE id = ? AND status = 'available'", [booking.carId]);
        if ((cars as any[]).length === 0) {
            res.status(400).json({ error: 'Car is not available for booking' });
            return;
        }

        const [result] = await db.query(
            'INSERT INTO bookings (user_id, car_id, booking_date, status, type, message) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, booking.carId, booking.bookingDate, 'pending', booking.type, booking.message || null]
        );

        await db.query("UPDATE cars SET status = 'reserved' WHERE id = ?", [booking.carId]);

        const newBooking = { ...booking, id: (result as any).insertId, userId, status: 'pending' };
        res.status(201).json(newBooking);
    } catch (error) {
        next(error);
    }
};

export const getAllBookings: RequestHandler = async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT bookings.*, 
                   users.username, 
                   cars.*, 
                   models.name AS model_name, 
                   brands.name AS brand_name
            FROM bookings
            JOIN users ON bookings.user_id = users.id
            JOIN cars ON bookings.car_id = cars.id
            JOIN models ON cars.model_id = models.id
            JOIN brands ON models.brand_id = brands.id
        `);
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

// ปรับฟังก์ชัน getMyBookings โดยลบ return
export const getMyBookings: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                bookings.id,
                bookings.car_id AS carId,
                bookings.booking_date AS bookingDate,
                bookings.status,
                bookings.type,
                bookings.message,
                bookings.created_at,
                models.name AS model_name,
                brands.name AS brand_name
            FROM bookings
            JOIN cars ON bookings.car_id = cars.id
            JOIN models ON cars.model_id = models.id
            JOIN brands ON models.brand_id = brands.id
            WHERE bookings.user_id = ?
        `, [userId]);

        // Log ข้อมูลที่ได้จาก query เพื่อช่วย debug
        console.log(`[getMyBookings] userId: ${userId}, rows:`, rows);

        // ตรวจสอบว่า rows เป็น array และแปลงให้อยู่ในรูปแบบที่ frontend คาดหวัง
        const bookings = Array.isArray(rows) ? rows : [];
        if (bookings.length === 0) {
            res.status(200).json([]);
            return;
        }

        res.status(200).json(bookings);
    } catch (error: any) {
        console.error(`[getMyBookings] Error for userId ${userId}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
};

export const updateBooking: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const booking: Booking = req.body;

    if (!booking.status) {
        res.status(400).json({ error: 'Status is required' });
        return;
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(booking.status)) {
        res.status(400).json({ error: `Invalid status. Status must be one of: ${validStatuses.join(', ')}` });
        return;
    }

    try {
        const [existingBookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if ((existingBookings as any[]).length === 0) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [booking.status, id]
        );

        if (booking.status === 'rejected') {
            const [bookingData] = await db.query('SELECT car_id FROM bookings WHERE id = ?', [id]);
            const carId = (bookingData as any[])[0].car_id;
            await db.query("UPDATE cars SET status = 'available' WHERE id = ?", [carId]);
        }

        const updatedBooking = { ...booking, id: Number(id) };
        res.json(updatedBooking);
    } catch (error: any) {
        console.error(`[updateBooking] Error for bookingId ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to update booking', details: error.message });
    }
};