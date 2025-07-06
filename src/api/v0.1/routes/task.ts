import { Router } from 'express';
import { validarJWT } from '../middelware/validateJWT.js';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskTypes } from '../controllers/task.controller.js';

const router = Router();

router.post('/', validarJWT, createTask);
router.post('/tasks', validarJWT, getTasks);

router.get('/taskTypes', [], getTaskTypes);
router.get('/:taskId', validarJWT, getTaskById);

router.put('/:taskId', validarJWT, updateTask);

router.delete('/:taskId', validarJWT, deleteTask);

export default router;