import { Request, Response, NextFunction } from "express";
import { logger } from "./logger"; // Assuming you have a logger set up
import { UserInterface } from "../models/user.model";
type RequestWithUser = Request & { [key: string]: any, user?: UserInterface, userIP?: string };

export const asyncHandler = (
  fn: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(async (error) => {
      try {
        // Dynamically import stack-trace
        const stackTrace = (await import("stack-trace")).default;

        // Parse the error stack trace
        const trace = stackTrace.parse(error);
        const firstFrame = trace[0] as any;
        const { fileName = "", lineNumber = '', columnNumber = "" } = firstFrame ? {
            fileName: firstFrame.getFileName(),
            lineNumber: firstFrame.getLineNumber(),
            columnNumber: firstFrame.getColumnNumber()
        } : {};

        // Log the error details, including file name, line number, column number
        logger.error({
          message: error.message,
          stack: error.stack,
          fileName,
          lineNumber,
          columnNumber,
        });
      } catch (err) {
        // If parsing the stack trace fails, log the error directly
        logger.error({
          message: "Failed to capture stack trace",
          error: err,
        });
      }

      // Pass the error to the Express error handler
      next(error);
    });
  };
};
