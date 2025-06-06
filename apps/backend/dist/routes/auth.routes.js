"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.default.registerUser);
router.post("/login", auth_controller_1.default.loginUser);
router.get("/logout", auth_controller_1.default.logoutUser);
// Google OAuth routes
router.get('/google/url', auth_controller_1.default.getGoogleAuthUrl);
router.post('/google/callback', auth_controller_1.default.handleGoogleCallback);
router.post("/send-otp", auth_controller_1.default.sendResetOTP);
router.post("/verify-otp", auth_controller_1.default.verifyOTP);
router.post("/reset-password", auth_controller_1.default.resetPassword);
router.post("/initial-reset-password", auth_controller_1.default.initialPasswordReset);
exports.default = router;
