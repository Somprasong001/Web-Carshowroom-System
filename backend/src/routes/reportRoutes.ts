import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { getUserActivity, getRegistrationTrends } from '../controllers/reportController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/user-activity', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getUserActivity as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.get('/registration-trends', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, adminMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getRegistrationTrends as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);

export default router;