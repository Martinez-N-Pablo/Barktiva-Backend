import { Router } from 'express';
import { changePassword, createUser, updateUser, deleteUser, getUserById, getUsers, addPetToUser } from '../controllers/user.controller.js';
import { validarJWT } from '../middelware/validateJWT.js';

const router = Router();

/**
 * Get
 */
// Get user by ID
router.get('/:id', validarJWT, getUserById);

/**
 * Post
 */
// Create new user
router.post('/', createUser);
// Get all users
router.post('/users', getUsers);
// Add pet to user
router.post('/:id', validarJWT, addPetToUser);

/**
 * Put
 */
// Update user
router.put('/:id', validarJWT, updateUser);
// Change user password
router.put('/:id/password', validarJWT, changePassword);

/**
 * Delete
 */
// Delete user
router.delete('/:id', validarJWT, deleteUser);


export default router;