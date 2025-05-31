"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const validateRequest_1 = require("../middleware/validateRequest");
const auth_validation_1 = require("../validations/auth.validation");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.default.registerUser);
router.post("/login", auth_controller_1.default.loginUser);
// Password reset routes
router.post("/send-otp", (0, validateRequest_1.validateRequest)(auth_validation_1.sendOtpSchema), auth_controller_1.default.sendResetOTP);
router.post("/verify-otp", (0, validateRequest_1.validateRequest)(auth_validation_1.verifyOtpSchema), auth_controller_1.default.verifyOTP);
router.post("/reset-password", (0, validateRequest_1.validateRequest)(auth_validation_1.resetPasswordSchema), auth_controller_1.default.resetPassword);
// Google OAuth routes
router.get('/google/url', auth_controller_1.default.getGoogleAuthUrl);
router.post('/google/callback', auth_controller_1.default.handleGoogleCallback);
exports.default = router;
