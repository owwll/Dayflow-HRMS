import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { ApiResponse } from '../types';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err instanceof AppError) {
        const response: ApiResponse = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const response: ApiResponse = {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Database operation failed',
            },
        };
        res.status(500).json(response);
        return;
    }

    // Default error
    const response: ApiResponse = {
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
    };
    res.status(500).json(response);
};
