import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';

export const validarJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
    const token = req.header('x-token');

    if (!token) {
        res.status(400).json({
            message: 'Falta token de autorización'
        });
        return;
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWTTOKEN as string) as JwtPayload;

        req.uid = uid;
        next();
    } catch (err) {
        res.status(400).json({
        message: 'Token no válido'
        });
    }
};
