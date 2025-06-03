import { Router } from 'express';
import { renovarToken } from '../controllers/auth.controller.js';
import { validarJWT } from '../middelware/validateJWT.js';
import { login } from '../controllers/auth.controller.js';

const router = Router();

router.get('/verifyToken', validarJWT, renovarToken);
router.post('/', login);

export default router;