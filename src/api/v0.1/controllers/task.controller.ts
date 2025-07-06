import { Response } from 'express';
import { Status } from '../utils/const/status.js';
import * as PetService from '../services/pet.service.js';
import * as UserService from '../services/user.service.js';
import * as TaskService from '../services/task.service.js';
import mongoose, { Types } from 'mongoose';
import { SortOrder } from '../utils/const/sortOrder.js';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { pets } = req.body;
  const uid = req.uid || "";

  if (!uid) {
    res.status(Status.Unauthorized).json({ message: 'Error de permisos' });
    return;
  }

  if (!pets || pets.length <= 0) {
    res.status(Status.BadRequest).json({ message: 'Faltan las mascotas asociadas a la tarea.' });
    return;
  }

  req.body.user = uid;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [task] = await TaskService.createTaskService(req.body, session);

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      res.status(Status.Error).json({ message: 'Error al crear la tarea' });
      return;
    }

    // Agregar la tarea al usuario
    await UserService.addTaskToUser(uid, task._id, session);

    // Agregar la tarea a cada mascota individualmente
    await Promise.all(
      pets.map((petId: string) => PetService.addTaskToPet(petId, task._id, session))
    );

    await session.commitTransaction();
    session.endSession();

    res.status(Status.Correct).json({
      message: 'Tarea registrada correctamente',
      task
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(Status.Error).json({
      message: 'Error al registrar la tarea',
      error: (error as Error).message
    });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;

  try {
    const task = await TaskService.getTaskByIdService(taskId);
    
    if (!task) {
      res.status(Status.NotFound).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.status(Status.Correct).json(task);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener la tarea',
      error: (error as Error).message
    });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const uid = req.uid || "";

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const task = await TaskService.deleteTaskService(taskId, uid, session);
    
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      res.status(Status.NotFound).json({ message: 'Tarea no encontrada' });
      return;
    }

    await UserService.removeTaskFromUser(task.user.toString(), task._id, session);

    for (const petId of task.pets) {
      await PetService.removeTaskFromPet(petId.toString(), task._id.toString(), session);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(Status.Correct).json({ message: 'Tarea eliminada con éxito.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(Status.Error).json({ message: 'Error al eliminar la tarea.', error: (error as Error).message });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const {...taskBodyUpdate } = req.body;
    const uid = req.uid || "";

    if (!uid || !taskId) {
      res.status(Status.BadRequest).json({ message: 'Faltan los identificadores del usuario o de la tarea.' });
      return;
    }

    req.body.user = uid;
  
    try {
      const updatedTask = await TaskService.updateTaskService(taskId, taskBodyUpdate);
  
      if (!updatedTask) {
        res.status(Status.NotFound).json({ message: 'Tarea no encontrada' });
        return;
      }
  
      res.status(Status.Correct).json({
        message: 'Tarea actualizada correctamente',
        updatedTask
      });
    } catch (error) {
      res.status(Status.Error).json({
        message: 'Error al actualizar la tarea',
        error: (error as Error).message
      });
    }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page: number = Number(req.body.page) || Number(process.env.page);
  const size: number = Number(req.body.size) || Number(process.env.size);
  const sort: string = req.body.sort || SortOrder.ASC;
  const uid: string = req.uid || "";
  const { pets } = req.body;

  // Convert pets to Types.ObjectId[]
  let petsArray: Types.ObjectId[] | undefined = undefined;

  if (pets) {
    if (Array.isArray(pets)) {
      petsArray = pets.map((pet) => new Types.ObjectId(pet as string));
    } else if (typeof pets === 'string') {
      petsArray = pets.split(',').map((pet) => new Types.ObjectId(pet.trim()));
    }
  }

  try {
    const tasks = await TaskService.getTasksService({
      page: Number(page),
      size: Number(size),
      sort: String(sort),
      user: uid ? String(uid) : undefined,
      pets: petsArray
    });

    res.status(Status.Correct).json(tasks);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener las tareas',
      error: (error as Error).message
    });
  }
};

export const getTaskTypes = async(req: AuthenticatedRequest, res: Response): Promise<any> => {
  const page: number = Number(process.env.page);
  const size: number = Number(process.env.ILIMIT_SIZE) ;
  const sort: string = SortOrder.ASC || "";

  try {
    const tasks = await TaskService.getTaskTypesService({
      page: Number(page),
      size: Number(size),
      sort: String(sort),
    });

    res.status(Status.Correct).json(tasks);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener los tipos de tareas',
      error: (error as Error).message
    });
  }
};