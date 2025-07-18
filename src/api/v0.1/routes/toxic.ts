import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { getToxics } from '../controllers/toxics.controller.js';

const router = Router();

router.get('/', [], getToxics);

export default router;