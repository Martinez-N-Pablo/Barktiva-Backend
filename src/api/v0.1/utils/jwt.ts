import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWTTOKEN as string;

interface Payload {
  uid: string;
  role: string;
}

export const generarJWT = (payload: Payload): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' }, // token válido por 1 hora
      (err, token) => {
        if (err || !token) {
          reject('No se pudo generar el token');
        } else {
          resolve(token);
        }
      }
    );
  });
};
