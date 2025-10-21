import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { getAllCars, getCarById, createCar, updateCar, deleteCar } from '../controllers/carController';
import { adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllCars as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.get('/:id', getCarById as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.post('/', adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, createCar as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.put('/:id', adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, updateCar as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.delete('/:id', adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, deleteCar as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);

export default router;