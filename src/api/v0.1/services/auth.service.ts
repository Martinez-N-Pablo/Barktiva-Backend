import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generarJWT } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';

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

export const loginService = async (email: string, password: string) => {
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
    message: 'Login exitoso',
    uid: user._id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    token
  };
};
