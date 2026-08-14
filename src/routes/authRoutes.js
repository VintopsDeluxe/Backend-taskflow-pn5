import { Router } from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'; // or userController.js depending on your setup
import { validate } from '../middlewares/validate.js';
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
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;