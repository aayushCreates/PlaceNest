import { Request, Response, NextFunction } from "express";


export const errorMiddleware = async (err, req: Request, res: Response, next: NextFunction)=> {
    const message = err.message || "something went wrong";
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: message
    })
}

