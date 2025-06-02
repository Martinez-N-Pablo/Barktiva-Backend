import { Request, Response } from 'express';
import { Status } from '../utils/const/status.js';
import * as PetService from '../services/pet.service.js';
import * as UserService from '../services/user.service.js';
import * as TaskService from '../services/task.service.js';
import { Types } from 'mongoose';
import { SortOrder } from '../utils/const/sortOrder.js';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { user, pets } = req.body;
  const userFromParams: string = req.params.uid;

  if (!user || !userFromParams) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  if( !pets || pets.lenth <= 0) {
    res.status(Status.BadRequest).json({ message: 'Faltan las mascotas asociadas a la tarea.' });
    return;
  }

  if (user !== userFromParams) {
    res.status(Status.Unauthorized).json({ message: 'Error de permisos' });
    return;
  }

  console.log('userFromParams', userFromParams);
  console.log('body', req.body);

  try {
    const task = await TaskService.createTaskService(req.body);

    if(!task) {
      res.status(Status.Error).json({ message: 'Error al crear la tarea' });
      return;
    }

    // If the task was created successfully, add it to the user and pets
    await Promise.all([
      UserService.addPetToUser(userFromParams, task._id),
      PetService.addTaskToPet(pets, task._id)
    ]);

    res.status(Status.Correct).json({
      message: 'Tarea registrada correctamente',
      task
    });
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al registrar la tarea',
      error: (error as Error).message
    });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const task = await TaskService.getTaskByIdService(id);
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

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { uid, taskId } = req.params;

  try {
    const task = await TaskService.deleteTaskService(taskId, uid);

    if(!task) {
      res.status(Status.NotFound).json({ message: 'Tarea no encontrada' });
      return;
    }

    await Promise.all([
      UserService.removeTaskFromUser(task.user.toString(), task._id),
      ...task.pets.map((petId: Types.ObjectId) =>
        PetService.removeTaskFromPet(petId.toString(), task._id.toString())
      )
    ]);

    res.status(Status.Correct).json({ message: 'Tarea eliminada con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al eliminar la tarea.', error: (error as Error).message });
  }
};

// export const getTasks = async (req: Request, res: Response): Promise<void> => {
//   const { uid, taskId } = req.params;
//   const taskBodyUpdate = req.body;

//   try {
//     const updatedTask = await TaskService.getAllTasksService(taskId, taskBodyUpdate);

//     if (!updatedTask) {
//       res.status(Status.NotFound).json({ message: 'Tarea no actualizada' });
//       return;
//     }

//     res.status(Status.Correct).json({
//       message: 'Tarea actualizada correctamente',
//       updatedTask
//     });
//   } catch (error) {
//     res.status(Status.Error).json({
//       message: 'Error al actualizar la tarea',
//       error: (error as Error).message
//     });
//   }
// };

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    const { uid, taskId } = req.params;
    const {...taskBodyUpdate } = req.body;

    if (!uid || !taskId) {
      res.status(Status.BadRequest).json({ message: 'Faltan los identificadores del usuario o de la tarea.' });
      return;
    }
  
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

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { page = process.env.page || 1, size = process.env.size || 10, sort = SortOrder.ASC, user, pets } = req.query;

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
      user: user ? String(user) : undefined,
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