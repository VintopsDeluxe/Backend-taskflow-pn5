import { Router } from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp // 1. Import it here
} from '../controllers/authController.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/userSchema.js';

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', verifyOtp); // 2. Add the route here
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;