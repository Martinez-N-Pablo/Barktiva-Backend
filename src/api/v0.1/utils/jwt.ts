import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWTTOKEN || 'clave-secreta-temporal';

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
