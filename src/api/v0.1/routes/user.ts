import { Router } from 'express';
import { changePassword, createUser, updateUser, deleteUser, getUserById, getUsers, addPetToUser } from '../controllers/user.controller.js';
import { validarJWT } from '../middelware/validateJWT.js';
import { upload } from '../middelware/upload.js';

const router = Router();

/**
 * Get
 */
// Get user by ID
router.get('/', validarJWT, getUserById);

/**
 * Post
 */
// Create new user
router.post('/', createUser);
// Get all users
router.post('/users', getUsers);
// Add pet to user
router.post('/:petId', validarJWT, addPetToUser);

/**
 * Put
 */
// Update user
router.put('/', [validarJWT,  upload.single('photo')], updateUser);
// Change user password
router.put('/:id/password', validarJWT, changePassword);

/**
 * Delete
 */
// Delete user
router.delete('/', validarJWT, deleteUser);


export default router;