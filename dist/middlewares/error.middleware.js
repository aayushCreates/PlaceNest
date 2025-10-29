"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = async (err, req, res, next) => {
    const message = err.message || "something went wrong";
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: message
    });
};
exports.errorMiddleware = errorMiddleware;
