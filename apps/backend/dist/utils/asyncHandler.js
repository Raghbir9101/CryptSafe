"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const logger_1 = require("./logger"); // Assuming you have a logger set up
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(async (error) => {
            try {
                // Dynamically import stack-trace
                const stackTrace = (await import("stack-trace")).default;
                // Parse the error stack trace
                const trace = stackTrace.parse(error);
                const firstFrame = trace[0];
                const { fileName = "", lineNumber = '', columnNumber = "" } = firstFrame ? {
                    fileName: firstFrame.getFileName(),
                    lineNumber: firstFrame.getLineNumber(),
                    columnNumber: firstFrame.getColumnNumber()
                } : {};
                // Log the error details, including file name, line number, column number
                logger_1.logger.error({
                    message: error.message,
                    stack: error.stack,
                    fileName,
                    lineNumber,
                    columnNumber,
                });
            }
            catch (err) {
                // If parsing the stack trace fails, log the error directly
                logger_1.logger.error({
                    message: "Failed to capture stack trace",
                    error: err,
                });
            }
            // Pass the error to the Express error handler
            next(error);
        });
    };
};
exports.asyncHandler = asyncHandler;
