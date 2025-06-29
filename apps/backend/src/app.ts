import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler";
import path from "path";
dotenv.config();

const app: Application = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json());

// Routes
// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });

export default app;


