import bcrypt from 'bcrypt';

export const verifyCurrentPassword = async (user: any, password: string) => {
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('La contraseña actual es incorrecta.');
};
