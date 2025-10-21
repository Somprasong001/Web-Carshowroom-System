import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import { Car, User, JwtPayload } from '../types';
import { RowDataPacket } from 'mysql2';

interface CarRow extends RowDataPacket {
    id: number;
    model_id: number;
    year: number;
    price: number;
    description: string;
    image_url: string;
    model_3d_url: string;
    status: 'available' | 'sold' | 'reserved';
    color?: string;
    mileage?: number;
    fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    model_name: string;
    brand_name: string;
}

interface AuthenticatedRequest extends Request {
    user?: User | JwtPayload;
}

export const getAllCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const [rows] = await db.query<CarRow[]>(
            `SELECT cars.*, 
                   models.name AS model_name, 
                   brands.name AS brand_name
            FROM cars
            JOIN models ON cars.model_id = models.id
            JOIN brands ON models.brand_id = brands.id
            WHERE cars.status = 'available'`
        );
        res.json(rows);
    } catch (error: any) {
        console.error('Error in getAllCars:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
        next(error);
    }
};

export const getCarById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const [rows] = await db.query<CarRow[]>(
            `SELECT cars.*, 
                   models.name AS model_name, 
                   brands.name AS brand_name
            FROM cars
            JOIN models ON cars.model_id = models.id
            JOIN brands ON models.brand_id = brands.id
            WHERE cars.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            res.status(404).json({ error: 'ไม่พบรถ' });
            return;
        }
        res.json(rows[0]);
    } catch (error: any) {
        console.error('Error in getCarById:', error);
        res.status(500).json({ error: 'Failed to fetch car' });
        next(error);
    }
};

export const createCar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admins only.' });
        return;
    }

    const car: Car = req.body;

    if (!car.modelId || !car.year || !car.price || !car.description || !car.imageUrl || !car.model3dUrl || !car.status) {
        res.status(400).json({ error: 'กรุณาระบุทุกช่องที่จำเป็น' });
        return;
    }

    if (car.price <= 0) {
        res.status(400).json({ error: 'ราคาต้องเป็นจำนวนบวก' });
        return;
    }

    const validStatuses = ['available', 'sold', 'reserved'];
    if (!validStatuses.includes(car.status)) {
        res.status(400).json({ error: `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(', ')}` });
        return;
    }

    try {
        const [result] = await db.query(
            'INSERT INTO cars (model_id, year, price, description, image_url, model_3d_url, status, color, mileage, fuel_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [car.modelId, car.year, car.price, car.description, car.imageUrl, car.model3dUrl, car.status, car.color || null, car.mileage || 0, car.fuelType || 'petrol']
        );
        const newCar = { ...car, id: (result as any).insertId };
        res.status(201).json(newCar);
    } catch (error: any) {
        console.error('Error in createCar:', error);
        res.status(500).json({ error: 'Failed to create car' });
        next(error);
    }
};

export const updateCar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admins only.' });
        return;
    }

    const { id } = req.params;
    const car: Car = req.body;

    if (!car.modelId || !car.year || !car.price || !car.description || !car.imageUrl || !car.model3dUrl || !car.status) {
        res.status(400).json({ error: 'กรุณาระบุทุกช่องที่จำเป็น' });
        return;
    }

    if (car.price <= 0) {
        res.status(400).json({ error: 'ราคาต้องเป็นจำนวนบวก' });
        return;
    }

    const validStatuses = ['available', 'sold', 'reserved'];
    if (!validStatuses.includes(car.status)) {
        res.status(400).json({ error: `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(', ')}` });
        return;
    }

    try {
        const [existingCars] = await db.query<RowDataPacket[]>('SELECT * FROM cars WHERE id = ?', [id]);
        if (existingCars.length === 0) {
            res.status(404).json({ error: 'ไม่พบรถ' });
            return;
        }

        await db.query(
            'UPDATE cars SET model_id = ?, year = ?, price = ?, description = ?, image_url = ?, model_3d_url = ?, status = ?, color = ?, mileage = ?, fuel_type = ? WHERE id = ?',
            [car.modelId, car.year, car.price, car.description, car.imageUrl, car.model3dUrl, car.status, car.color || null, car.mileage || 0, car.fuelType || 'petrol', id]
        );
        const updatedCar = { ...car, id: Number(id) };
        res.json(updatedCar);
    } catch (error: any) {
        console.error('Error in updateCar:', error);
        res.status(500).json({ error: 'Failed to update car' });
        next(error);
    }
};

export const deleteCar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admins only.' });
        return;
    }

    const { id } = req.params;
    try {
        const [existingCars] = await db.query<RowDataPacket[]>('SELECT * FROM cars WHERE id = ?', [id]);
        if (existingCars.length === 0) {
            res.status(404).json({ error: 'ไม่พบรถ' });
            return;
        }

        await db.query('DELETE FROM bookings WHERE car_id = ?', [id]);
        await db.query('DELETE FROM cars WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error in deleteCar:', error);
        res.status(500).json({ error: 'Failed to delete car' });
        next(error);
    }
};