import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { createPet, getPets, getPetById, updatePet, deletePet } from '../controllers/pet.controller.js';

const router = Router();

router.post('/:uid', validarJWT, createPet);
router.post('/', validarJWT, getPets);

router.get('/:id', validarJWT, getPetById);

router.put('/:uid/:petId', validarJWT, updatePet);
router.delete('/:uid/:petId', validarJWT, deletePet);

export default router;