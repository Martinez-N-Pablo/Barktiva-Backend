import { Router } from 'express';
import { changePassword, createUser, updateUser, deleteUser, getUserById, getUsers } from '../controllers/user.controller.js';
import { validarJWT } from '../middelware/validateJWT.js';

const router = Router();

router.post('/', createUser);
router.put('/:id', validarJWT, updateUser);
router.put('/:id/password', validarJWT, changePassword);
router.delete('/:id', validarJWT, deleteUser);
router.post('/', getUsers);
router.get('/:id', validarJWT, getUserById);


export default router;