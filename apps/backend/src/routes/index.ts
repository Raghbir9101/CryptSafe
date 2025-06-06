import { Router } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import { authenticateToken } from "../middlewares/authMiddleware";
import tableRouter from "./table.routes";
import adminRouter from "./admin.routes"

const router = Router();

// Routes that don't require authentication
router.use("/auth", authRoutes);  // Register and login routes

// Middleware that checks for a valid token (authentication)
router.use(authenticateToken);

// Routes that require authentication
router.use("/users", userRoutes);
router.use("/tables", tableRouter);
router.use("/admin",adminRouter)

export default router;
