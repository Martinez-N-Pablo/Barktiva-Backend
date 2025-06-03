import bcrypt from 'bcryptjs';
/**
 * Recibe una password en string y la devuelve cifrada
 * @param {string} password 
 * @returns password cifrada
 */
const hassPassword = (password: string): string => {
    if(!password){
        return 'No se ha recibido password';
    }

    const salt = bcrypt.genSaltSync();
    const cpassword = bcrypt.hashSync(password, salt);
    return cpassword;
};

export default hassPassword;