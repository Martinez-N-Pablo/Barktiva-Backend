import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generarJWT } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { FirebaseLoginType } from '../models/interfaces/firebaseLoginType.type.js';
import { link } from 'fs';
import { UserRepository } from '../repository/auth.repository.js';

interface JwtPayload {
  uid: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const renovarTokenService = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWTTOKEN as string) as JwtPayload;

  const { uid, role } = decoded;

  const usuario = await User.findById(uid);
  if (!usuario) {
    throw new Error('Token no válido: usuario no encontrado.');
  }

  const newToken = await generarJWT({ uid, role });

  return { usuario, newToken };
};

export const validarTokenService = async (token: string) => {
  const { uid, role } = jwt.verify(token, process.env.JWTTOKEN as string) as JwtPayload;

  const usuarioBD = await User.findById(uid);
  if (!usuarioBD) throw new Error('Token no válido: usuario no encontrado');

  const {
    name,
    surname,
    email,
    photo
  } = usuarioBD;

  return {
    message: 'Token válido',
    name,
    surname,
    role,
    email,
    token,
    photo
  };
};

export const loginService = async (email: string, password: string): Promise<{ uid: mongoose.Types.ObjectId, name: string, surname: string | undefined, email: string, token: string }>  => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Email o contraseña incorrectos');
  }

  if(!user.password) {
    throw new Error('Usuario no tiene contraseña establecida');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Email o contraseña incorrectos');
  }

  const token = await generarJWT({ uid: user._id.toString(), role: user.role || "" });

  return {
    uid: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    token
  };
};

/**
 * Creates or retrieves a local user account from a verified Firebase ID token.
 * 
 * Strategy:
 *  1) If a user already exists with this firebaseUid, treat it as a normal login and update basic profile/lastLogin.
 *  2) Otherwise, if the token contains a verified email and a local user exists with that email, link the accounts
 *     by storing firebaseUid/provider on the existing user (account merge).
 *  3) If no matching local user exists, create a new one using the verified token claims.
 * Notes:
 * - Trust only values extracted from `verifyIdToken()` (server-side verified JWT), never from client-provided fields.
 * - `firebase_uid` should be UNIQUE, and `email` should be UNIQUE to avoid duplicates and race conditions.
 * 
 * @param decodedToken: FirebaseLoginType; User decoded data from firebase
 */
export const findOrLinkOrCreateUserFromFirebase = async (decodedToken: FirebaseLoginType) => {
  const { firebaseUid, email, emailVerified, provider, displayName, photoUrl } = decodedToken;

  if(!email || !emailVerified) {
    throw new Error('Email no verificado o no proporcionado');
  }

  if(!firebaseUid) {
    throw new Error('Firebase UID no proporcionado');
  }

  // 1) Check if user exists by firebaseUid
  let user = await UserRepository.findUserByFirebaseUid(firebaseUid);
  
  if(user) {
    // User found, update last login and basic profile info, if available.
    const updateUser = await UserRepository.updateLoginAndProfileByFirebaseUid(
      firebaseUid, 
      { displayName: displayName || "", photoUrl: photoUrl || "" }
    );
    
    if(!updateUser) {
      throw new Error('Error al actualizar el usuario desde Firebase');
    }

    const token = await generarJWT({ uid: updateUser._id.toString(), role: updateUser.role || "" });

    return {
      name: updateUser.name,
      surname: updateUser.surname,
      email: updateUser.email,
      token
    };
  }

  // 2) User not found by firebaseUID, check if user exists alredy by email
  user = await UserRepository.findUserByEmail(email);
  
  if(user) {
    // User found by email, link accounts by setting firebaseUid and provider
    const linkedUser = await UserRepository.linkFirebaseToExistingUserWithEmail(
      email, 
      { firebaseUid, provider, displayName: displayName || "", photoUrl: photoUrl || "" }
    );

    if(!linkedUser) {
      throw new Error('Error al vincular el usuario desde Firebase');
    }
      
    const token = await generarJWT({ uid: linkedUser._id.toString(), role: linkedUser.role || "" });

    return {
      name: linkedUser.name,
      surname: linkedUser.surname,
      email: linkedUser.email,
      token
    };
  }
  
  // 3) User not found by either firebaseUid or email, create new user
  const newUser = await UserRepository.createUserWithFirebaseData({
    email,
    firebaseUid,
    provider,
    displayName: displayName || "",
    photoUrl: photoUrl || ""
  });

  if(!newUser) {
    throw new Error('Error al crear el usuario desde Firebase');
  }

  const token = await generarJWT({ uid: newUser._id.toString(), role: newUser.role || "" });

  return {
    name: newUser.name,
    surname: newUser.surname,
    email: newUser.email,
    token
  };
};
