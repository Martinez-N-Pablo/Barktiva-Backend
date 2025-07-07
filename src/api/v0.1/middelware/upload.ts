import multer from 'multer';

// Almacenamiento en memoria para enviar a firebase
const storage = multer.memoryStorage();
export const upload = multer({ storage });