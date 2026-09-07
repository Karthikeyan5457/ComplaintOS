import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../types/schemas';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.get('/me', authenticate, (req, res) => authController.getProfile(req, res));
router.post('/avatar', authenticate, upload.single('file'), (req, res) => authController.uploadAvatar(req, res));

export default router;
