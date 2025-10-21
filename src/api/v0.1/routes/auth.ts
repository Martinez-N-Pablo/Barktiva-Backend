import { Router } from 'express';
import { renovarToken, validarToken, loginWithFirebase } from '../controllers/auth.controller.js';
import { validarJWT } from '../middelware/validateJWT.js';
import { login } from '../controllers/auth.controller.js';

const router = Router();

router.get('/verifyToken', validarToken);
router.get('/renoveToken', renovarToken);
router.get('/auth/firebase', loginWithFirebase);
router.post('/', login);

export default router;