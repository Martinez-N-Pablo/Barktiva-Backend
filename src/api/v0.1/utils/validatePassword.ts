/**
 * Recibe 2 password como cadenas de texto, lo recibirá del front por parte de un usuario que quiera cambiar su pass.
 * Comprueba que no son vacias y que coinciden. 
 * True -> Si son validas
 * False -> No son la misma 
 * @param {string} password 
 * @param {string} repeat_password 
 * @returns
 */
const validatePassword = (password: string, repeat_password: string): boolean =>
  Boolean(password && repeat_password && password === repeat_password);

export default validatePassword;