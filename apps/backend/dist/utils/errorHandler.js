"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("./logger");
const errorCodes_1 = require("./errorCodes");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });
    res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
};
exports.errorHandler = errorHandler;
