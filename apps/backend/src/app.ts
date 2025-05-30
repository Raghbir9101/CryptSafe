import express, { Application } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler";
import CookieParser from "cookie-parser";
dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials: true
}));
app.use(CookieParser());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;


