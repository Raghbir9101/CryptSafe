import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/register", AuthController.registerUser);

router.post("/login", AuthController.loginUser);
router.get("/logout", AuthController.logoutUser);

// Google OAuth routes
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.post('/google/callback', AuthController.handleGoogleCallback);

router.post("/send-otp", AuthController.sendResetOTP);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/reset-password", AuthController.resetPassword);
router.post("/initial-reset-password", AuthController.initialPasswordReset);

export default router;
