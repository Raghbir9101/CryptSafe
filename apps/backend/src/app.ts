import express, { Application } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;


