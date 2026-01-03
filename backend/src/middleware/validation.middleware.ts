import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.reduce((acc, err) => {
                    const path = err.path.join('.');
                    acc[path] = err.message;
                    return acc;
                }, {} as Record<string, string>);

                next(new ValidationError('Validation failed', details));
            } else {
                next(error);
            }
        }
    };
};
