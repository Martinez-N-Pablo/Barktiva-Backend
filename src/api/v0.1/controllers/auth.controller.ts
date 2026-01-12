import { Request, Response } from 'express';
import { renovarTokenService, validarTokenService, loginService, findOrCreateUserByFirebaseToken } from '../services/auth.service.js';
import { Status } from '../utils/const/status.js';
import * as admin from 'firebase-admin';

export const renovarToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.header('authorization');

    if (!authHeader ) {
      res.status(Status.BadRequest).json({
        message: 'Falta token de autorización',
        token: '',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if(!token) {
      res.status(Status.BadRequest).json({
        message: 'Error en el formato del token',
        token: '',
      });
      return;
    }

    if(!token) {
      res.status(Status.BadRequest).json({
        message: 'Error en el formato del token',
        token: '',
      });
      return;
    }

    const { usuario, newToken } = await renovarTokenService(token);

    res.status(Status.Correct).json({
      message: 'Token renovado con éxito',
      usuario,
      rol: usuario.role,
      token: newToken
    });
  } catch (error) {
    res.status(Status.BadRequest).json({
      message: (error as Error).message || 'Token no válido',
      token: '',
    });
  }
};

export const validarToken = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.header('authorization');

  if (!authHeader ) {
    res.status(Status.BadRequest).json({
      message: 'Falta token de autorización',
      token: ''
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if(!token) {
    res.status(Status.BadRequest).json({
      message: 'Error en el formato del token',
      token: '',
    });
    return;
  }

  try {
    const responseData = await validarTokenService(token);
    res.status(Status.Correct).json(responseData);

  } catch (error) {
    res.status(Status.BadRequest).json({
      message: (error as Error).message || 'Token no válido',
      token
    });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const userData = await loginService(email, password);
    res.status(Status.Correct).json(userData);
  } catch (error) {
    res.status(Status.BadRequest).json({
      message: (error as Error).message || 'Error en login',
    });
  }
};

export const loginWithFirebase = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if(!idToken) {
    res.status(Status.BadRequest).json({ message: 'Falta el idToken' });
    return;
  }

  const decodedUser = await admin.auth().verifyIdToken(idToken).catch((error) => res.status(Status.BadRequest).json({ message: 'Token inválido' }));

  if (!decodedUser) {
    return;
  }

  console.log("Token recibido de Firebase:", idToken);
  console.log("Decoded user from Firebase:");
  console.log(decodedUser);

  const user = await findOrCreateUserByFirebaseToken(decodedUser);
};