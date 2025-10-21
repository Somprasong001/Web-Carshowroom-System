import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { sendContact, getContacts, replyContact, deleteContact } from '../controllers/contactController';

const router = Router();

router.post('/', authMiddleware, sendContact);
router.get('/', authMiddleware, adminMiddleware, getContacts);
router.post('/:id/reply', authMiddleware, adminMiddleware, replyContact);
router.delete('/:id', authMiddleware, adminMiddleware, deleteContact);

export default router;