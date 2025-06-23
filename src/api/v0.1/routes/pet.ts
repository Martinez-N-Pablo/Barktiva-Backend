import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { createPet, getPets, getPetById, updatePet, deletePet } from '../controllers/pet.controller.js';

const router = Router();

router.post('/', validarJWT, createPet);
router.post('/pets', validarJWT, getPets);

router.get('/:id', validarJWT, getPetById);

router.put('/:petId', validarJWT, updatePet);
router.delete('/:petId', validarJWT, deletePet);

export default router;