"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./utils/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// Routes
// app.get("/", (req, res) => {
//     res.send("Hello World!");
// });
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist")));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
app.use("/api", routes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../frontend/dist/index.html"));
});
exports.default = app;
