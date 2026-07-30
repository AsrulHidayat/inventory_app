import express from 'express';
import { body } from 'express-validator';
import { login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/login', [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
  handleValidationErrors
], login);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;
