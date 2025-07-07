import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { createPet, getPets, getPetById, updatePet, deletePet, getBreeds } from '../controllers/pet.controller.js';
import { upload } from '../middelware/upload.js';

const router = Router();

router.post('/', [validarJWT, upload.single('photo')], createPet);
router.post('/pets', [validarJWT, upload.single('photo')], getPets);

router.get('/breeds', validarJWT, getBreeds);
router.get('/:petId', validarJWT, getPetById);

router.put('/:petId', [validarJWT,  upload.single('photo')], updatePet);

router.delete('/:petId', validarJWT, deletePet);

export default router;