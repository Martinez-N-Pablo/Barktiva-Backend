/**
 * Recibe un archivo con extension
 *      video.mp4
 *      foto.png
 *      indes.js
 * Y devuelve el nombre del fichero sin la extension
 * @param {file} 
 * @returns string
 */
const removeExtension = (file: string) => file.split('.').slice(0, -1).join('.') || file;


export default removeExtension;
