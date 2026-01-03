import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import {
    registerSchema,
    loginSchema,
    verifyOTPSchema,
    changePasswordSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Admin creates employee
router.post(
    '/register',
    authenticate,
    requireAdmin,
    validate(registerSchema),
    authController.register.bind(authController)
);

// Login - Step 1
router.post(
    '/login',
    validate(loginSchema),
    authController.login.bind(authController)
);

// Verify OTP - Step 2
router.post(
    '/verify-otp',
    validate(verifyOTPSchema),
    authController.verifyOTP.bind(authController)
);

// Change password
router.put(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    authController.changePassword.bind(authController)
);

// Refresh token
router.post(
    '/refresh-token',
    validate(refreshTokenSchema),
    authController.refreshToken.bind(authController)
);

export default router;
