import { Request, Response } from 'express';
import { renovarTokenService, validarTokenService, loginService, findOrCreateUserByFirebaseToken, findOrLinkOrCreateUserFromFirebase } from '../services/auth.service.js';
import { Status } from '../utils/const/status.js';
// import * as admin from 'firebase-admin';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

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
  const authHeader = req.header('authorization');

  if(!authHeader) {
    res.status(Status.BadRequest).json({ message: 'Faltan datos en la cabecera' });
    return;
  }

  // Split token from "Bearer ..."
  const authenticationParts = authHeader.split(' ');

  const idToken = authenticationParts.length == 2 ? authenticationParts[1] : null;

  if (!idToken) {
    res.status(Status.BadRequest).json({ message: 'Formato del token invalido' });
    return;
  }

  /**
   * Verify the ID token (JWT) from Firebase, for this purpose,
   * we use the token verification method from Firebase Admin SDK with the token received from the client,
   * and with the second parameter, checkRevoked, set to true to ensure the token has not been revoked.
   */
  let decodedUser: DecodedIdToken;

  try {
    decodedUser = await getAuth().verifyIdToken(idToken, /* checkRevoked= */ true);
  } catch (error) {
    res.status(Status.BadRequest).json({ message: 'Token de Firebase no válido o revocado' });
    return;
  }

  if (!decodedUser) {
    return;
  }

  console.log("Token recibido de Firebase:", idToken);
  console.log("Decoded user from Firebase:");
  console.log(decodedUser);

  // Extract user information from decoded token
  const firebaseUid = decodedUser.uid;
  const email = decodedUser.email ?? null;
  const emailVerified = decodedUser.email_verified ?? false;
  const provider = decodedUser.firebase?.sign_in_provider ?? "unknown";
  const displayName = typeof decodedUser.name === "string" ? decodedUser.name : null;
  const photoUrl = typeof decodedUser.picture === "string" ? decodedUser.picture : null;

  // With the decoded user info, find, link or create the user in our system
  try {
    const res = findOrLinkOrCreateUserFromFirebase({
      firebaseUid,
      email,
      emailVerified,
      provider,
      displayName,
      photoUrl
    });
  } catch (error) {
    res.status(Status.BadRequest).json({ message: (error as Error).message || 'Error al procesar el usuario de Firebase' });
    return;
  }
};