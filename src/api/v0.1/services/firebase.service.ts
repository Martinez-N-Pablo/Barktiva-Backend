import { bucket } from "../../../config/config-firebase.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 * @param file: Express.Multer.File; Arhivo procesa por multer en memoria
 * @returns: Promise<string>; URL construida que apunta al archivo
 */
export const uploadImageToStorage = async (file: Express.Multer.File, fileName: string): Promise<string> => {
    const uniqueFileName = `users/${uuidv4()}-${file.originalname}`;
    
    const blob = bucket.file(uniqueFileName); // Se obtiene la referencia al arhcivo dentro del bucket de firebase
    const blobStream = blob.createWriteStream({
        metadata: {
        contentType: file.mimetype,
        },
    }); // stream de escritura

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
        });
        blobStream.end(file.buffer);
    });
};

/**
 * 
 * @param fileUrl: string; URL creada por la funcion uploadImageToStorage que apunta a la direcicon de la imagen a eliminar
 */
export const deleteImageFromStorage = async (fileUrl: string): Promise<void> => {
    const filePath = fileUrl.split(`https://storage.googleapis.com/${bucket.name}/`)[1]; // Se obtiene el fileName de la imagen
    if (filePath) {
        await bucket.file(filePath).delete().catch(() => {}); // Si existe el archivo, se elimina
    }
};