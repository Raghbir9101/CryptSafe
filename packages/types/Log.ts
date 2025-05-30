export default interface LogInterface {
    message: string;
    level: string;
    timestamp: Date;
    stack?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
}
