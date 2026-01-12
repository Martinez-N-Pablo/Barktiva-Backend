import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generarJWT } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

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

export const findOrCreateUserByFirebaseToken = async (decodedToken: any) => {
  const firebase_uid = decodedToken?.uid;
  const email = decodedToken?.email;
  const name = decodedToken?.name || '';
  const surname = decodedToken?.surname || '';
  const photo = decodedToken?.picture || '';
  const provider = decodedToken?.firebase?.sign_in_provider || 'google';

  // Check if token has email and firebase_uid
  if (!firebase_uid || !email) {
    throw new Error('Token de Firebase inválido');
  }

  // Check if user exists by firebase_uid
  let user = await User.findOne({ firebase_uid: firebase_uid });
};
