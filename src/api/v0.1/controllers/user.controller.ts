// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model.js'; //
import { UserInterface } from '../models/interfaces/user.interface.js';
import hassPassword from '../utils/hassPassword.js';
import validatePassword from '../utils/validatePassword.js';
import { Status } from '../utils/const/status.js';
import * as UserService from '../services/user.service.js';
import * as PetService from '../services/pet.service.js';
import * as TaskService from '../services/task.service.js';

import { SortOrder } from '../utils/const/sortOrder.js';
import { bucket } from '../../../config/config-firebase.js';
import { deleteImageFromStorage, uploadImageToStorage } from '../services/firebase.service.js';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';
import mongoose from 'mongoose';

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
 const { name, surname, email, password, confirmPassword, photo, birthdate } = req.body;

  if (!name || !email || !password) {
    res.status(Status.BadRequest).json({ message: 'Faltan campos obligatorios.' });
    return;
  }
  
  try {
    const user = await UserService.registerUser({
      name,
      surname,
      email,
      password,
      confirmPassword,
      photo,
      birthdate,
      role: 'user'
    });

    if(!user) {
      res.status(Status.BadRequest).json({ message: 'Error al crear el usuario en service.' });
      return;
    }

    res.status(Status.Correct).json({ message: 'Usuario creado con éxito.', user });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(Status.Unicidad).json({ message: 'Este correo electrónico ya está registrado.' });
    }
    else {
      res.status(Status.Error).json({ message: 'Error al crear el usuario.', error });
    }
    return;
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid: string = req.uid || "";
  const updates = req.body;

  if (!uid) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  try {
    const user = await UserService.getUserById(uid);

    // Si llega una nueva imagen la subimos
    if (req.file) {
      if (user.photo) { // si ya tenia una foto almacenada, la mandamos eliminar del firebase storage
        await deleteImageFromStorage(user.photo);
      }

      const newFileName = `users/${uid}_${Date.now()}.jpg`;
      const imageUrl = await uploadImageToStorage(req.file, newFileName);
      updates.photo = imageUrl;
    }

    const updatedUser = await UserService.updateUser(uid, updates);

    res.status(Status.Correct).json({ message: 'Usuario actualizado con éxito.', user: updatedUser });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al actualizar el usuario.', error: (error as Error).message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid: string = req.uid || "";
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!uid) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(Status.BadRequest).json({ message: 'Faltan campos obligatorios.' });
    return;
  }

  try {
    await UserService.changeUserPassword(uid, currentPassword, newPassword, confirmPassword);
    res.status(Status.Correct).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al cambiar la contraseña.', error: (error as Error).message });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid: string = req.uid || "";

  try {
    const user = await UserService.getUserById(uid);
    res.status(Status.Correct).json({ user });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al obtener el usuario.', error: (error as Error).message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid: string = req.uid || "";

  if (!uid) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserService.deleteUser(uid);

    if(!user) {
      await session.abortTransaction();
      res.status(Status.NotFound).json({ message: 'Usuario no encontrada' });
      return;
    }

    //Mientras no se pueda compartir mascotas o tareas entre usuarios, se eliminan
    if(Array.isArray(user.pets) && user.pets.length > 0) {
      for(const pet of user.pets) {
        await PetService.deletePetService(pet._id.toString(), user._id.toString(), session); 
      }
    }

    if(Array.isArray(user.tasks) && user.tasks.length > 0) {
      for(const task of user.tasks) {
        await TaskService.deleteTaskService(task._id.toString(), user._id.toString(), session); 
      }
    }

    await session.commitTransaction();
    res.status(Status.Correct).json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(Status.Error).json({ message: 'Error al eliminar el usuario.', error: (error as Error).message });
  } finally {
    session.endSession();
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page: number = Number(req.body.page) || 0;
  const size: number = Number(req.body.size) || 10;
  const sort: string = (req.body.sort as string).toLowerCase() || SortOrder.ASC;
  const { dni } = req.body;

  try {
    const users = await UserService.getUsers({ page, size, sort, dni });
    res.status(Status.Correct).json(users);
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al obtener los usuarios.', error: (error as Error).message });
  }
};

export const addPetToUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid = req.uid || "";
  const { petId } = req.body;

  if (!uid) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  if (!petId) {
    res.status(Status.BadRequest).json({ message: 'Falta el ID de la mascota.' });
    return;
  }

  try {
    const updatedUser = await UserService.addPetToUser(uid, petId);
    res.status(Status.Correct).json({ message: 'Mascota añadida al usuario con éxito.', user: updatedUser });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al añadir la mascota al usuario.', error: (error as Error).message });
  }
};

