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
// Google OAuth routes
router.get('/google/url', auth_controller_1.default.getGoogleAuthUrl);
router.post('/google/callback', auth_controller_1.default.handleGoogleCallback);
exports.default = router;
