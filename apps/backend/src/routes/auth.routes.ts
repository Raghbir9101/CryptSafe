import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

router.post("/register", AuthController.registerUser);

router.post("/login", AuthController.loginUser);

// Google OAuth routes
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.post('/google/callback', AuthController.handleGoogleCallback);

export default router;
