import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller.js';

const router = Router();

router.post('/:uid', validarJWT, createTask);
router.post('/', validarJWT, getTasks);

router.get('/:id', validarJWT, getTaskById);

router.put('/:uid/:taskId', validarJWT, updateTask);
router.delete('/:uid/:taskId', validarJWT, deleteTask);

export default router;