// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model.js'; //
import { UserInterface } from '../models/interfaces/user.interface.js';
import hassPassword from '../utils/hassPassword.js';
import validatePassword from '../utils/validatePassword.js';
import { Status } from '../utils/const/status.js';
import * as UserService from '../services/user.service.js';
import { SortOrder } from '../utils/const/sortOrder.js';
import { bucket } from '../../../config/config-firebase.js';
import { deleteImageFromStorage, uploadImageToStorage } from '../services/firebase.service.js';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';

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
      birthdate
    });

    if(!user) {
      res.status(Status.BadRequest).json({ message: 'Error al crear el usuario en service.' });
      return;
    }

    res.status(Status.Correct).json({ message: 'Usuario creado con éxito.', user });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al crear el usuario.', error });
    return;
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const uid: string = req.uid || "";
  const updates = req.body;

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
  const { id } = req.params;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(Status.BadRequest).json({ message: 'Faltan campos obligatorios.' });
    return;
  }

  try {
    await UserService.changeUserPassword(id, currentPassword, newPassword, confirmPassword);
    res.status(Status.Correct).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al cambiar la contraseña.', error: (error as Error).message });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await UserService.getUserById(id);
    res.status(Status.Correct).json({ user });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al obtener el usuario.', error: (error as Error).message });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await UserService.deleteUser(id);
    res.status(Status.Correct).json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al eliminar el usuario.', error: (error as Error).message });
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
  const { id } = req.params;
  const { petId } = req.body;

  if (!petId || !id) {
    res.status(Status.BadRequest).json({ message: 'Falta el ID de la mascota.' });
    return;
  }

  try {
    const updatedUser = await UserService.addPetToUser(id, petId);
    res.status(Status.Correct).json({ message: 'Mascota añadida al usuario con éxito.', user: updatedUser });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al añadir la mascota al usuario.', error: (error as Error).message });
  }
};

