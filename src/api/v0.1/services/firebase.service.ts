import { bucket } from "../../../config/config-firebase.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 * @param file: Express.Multer.File; Arhivo procesa por multer en memoria
 * @returns: Promise<string>; URL construida que apunta al archivo
 */
export const uploadImageToStorage = async (file: Express.Multer.File, fileName: string): Promise<string> => {
    const blob = bucket.file(fileName); // Se obtiene la referencia al arhcivo dentro del bucket de firebase
    const blobStream = blob.createWriteStream({
        metadata: {
        contentType: file.mimetype,
        },
    }); // stream de escritura

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
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
    const regex = /\/o\/(.*?)\?alt=media/;
    const match = fileUrl.match(regex);
    const filePath = match ? decodeURIComponent(match[1]) : null;

    if (filePath) {
        await bucket.file(filePath).delete().catch(() => {});
    }
};