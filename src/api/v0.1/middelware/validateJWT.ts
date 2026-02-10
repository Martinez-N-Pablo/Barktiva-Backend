import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';

export const validarJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
    const authHeader = req.header('authorization');
    
    if (!authHeader ) {
        res.status(400).json({
            message: 'Falta información en el header'
        });
        return;
    }

    const token: string = authHeader.split(' ')[1];

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
