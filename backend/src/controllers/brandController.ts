import { RequestHandler } from 'express';
import db from '../config/db';

export const getAllBrands: RequestHandler = async (req, res, next) => {
    try {
        const [brands] = await db.query('SELECT * FROM brands');
        res.json(brands);
    } catch (error) {
        next(error);
    }
};

export const getModelsByBrand: RequestHandler = async (req, res, next) => {
    const { brand_id } = req.params;
    try {
        const [models] = await db.query('SELECT * FROM models WHERE brand_id = ?', [brand_id]);
        res.json(models);
    } catch (error) {
        next(error);
    }
};