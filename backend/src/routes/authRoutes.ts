import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { login, register, getDashboardData, getRecentActivity } from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.post('/register', register as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.get('/dashboard', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getDashboardData as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.get('/recent-activity', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getRecentActivity as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);

export default router;