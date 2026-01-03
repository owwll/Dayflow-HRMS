import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { Role } from '../types';

export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ForbiddenError('User not authenticated');
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireAdmin = requireRole(Role.ADMIN);
export const requireEmployee = requireRole(Role.EMPLOYEE);
export const requireAny = requireRole(Role.ADMIN, Role.EMPLOYEE);
