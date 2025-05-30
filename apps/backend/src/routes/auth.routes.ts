import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, sendOtpSchema, verifyOtpSchema, resetPasswordSchema } from '../validations/auth.validation';

const router = Router();

router.post("/register", AuthController.registerUser);

router.post("/login", AuthController.loginUser);

// Password reset routes
router.post("/send-otp", validateRequest(sendOtpSchema), AuthController.sendResetOTP);
router.post("/verify-otp", validateRequest(verifyOtpSchema), AuthController.verifyOTP);
router.post("/reset-password", validateRequest(resetPasswordSchema), AuthController.resetPassword);

// Google OAuth routes
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.post('/google/callback', AuthController.handleGoogleCallback);

export default router;
