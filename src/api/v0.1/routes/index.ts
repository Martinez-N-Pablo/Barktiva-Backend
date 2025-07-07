import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Router } from 'express';
import removeExtension from '../utils/removeExtension.js';

const router = Router();

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer archivos del directorio actual
const files = fs.readdirSync(__dirname);

let hasLoadedRoutes = false;

for (const file of files) {
  const fileWithoutExt = removeExtension(file);
  const ext = path.extname(file); // Extrae la extensión (".ts" o ".js")
  const isTsOrJs = ['.ts', '.js'].includes(ext);

  // Ignorar el archivo actual y los archivos que no son .ts o .js
  if (!['index'].includes(fileWithoutExt) && isTsOrJs) {
    const fullPath = pathToFileURL(path.join(__dirname, file)).href;
    const module = await import(fullPath);  // Importación dinámica con ES Modules

    router.use(`/${fileWithoutExt}`, module.default); // Monta el router en su ruta
    console.log(`Ruta cargada: /${fileWithoutExt}`);
    hasLoadedRoutes = true;
  }
}

// Si no hay rutas cargadas, responder con error en /api/
if (!hasLoadedRoutes) {
  console.warn('No se encontraron rutas disponibles.');
  router.get('/', (req, res) => {
    res.status(404).json({ error: 'No se encontraron rutas definidas' });
  });
}

// Ruta catch-all para errores 404 al final
router.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default router;
