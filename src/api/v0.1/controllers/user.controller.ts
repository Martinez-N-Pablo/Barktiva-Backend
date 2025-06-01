// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model.js'; //
import { UserInterface } from '../models/interfaces/user.interface.js';
import hassPassword from '../utils/hassPassword.js';
import validatePassword from '../utils/validatePassword.js';
import { Status } from '../utils/const/status.js';
import * as UserService from '../services/user.service.js';
import { SortOrder } from '../utils/const/sortOrder.js';

export const createUser = async (req: Request, res: Response): Promise<void> => {
 const { name, surname, email, password, repeatPassword, photo, birthdate } = req.body;

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
      repeatPassword,
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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;
  const token = req.headers['x-token'];

  try {
    const updatedUser = await UserService.updateUser(id, token, updates);

    res.status(Status.Correct).json({ message: 'Usuario actualizado con éxito.', user: updatedUser });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al actualizar el usuario.', error: (error as Error).message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { currentPassword, newPassword, repeatPassword } = req.body;

  if (!currentPassword || !newPassword || !repeatPassword) {
    res.status(Status.BadRequest).json({ message: 'Faltan campos obligatorios.' });
    return;
  }

  try {
    await UserService.changeUserPassword(id, currentPassword, newPassword, repeatPassword);
    res.status(Status.Correct).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al cambiar la contraseña.', error: (error as Error).message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await UserService.getUserById(id);
    res.status(Status.Correct).json({ user });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al obtener el usuario.', error: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await UserService.deleteUser(id);
    res.status(Status.Correct).json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al eliminar el usuario.', error: (error as Error).message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page: number = Number(req.body.page) || 0;
  const limit: number = Number(req.body.limit) || 10;
  const sort: string = req.body.sort || SortOrder.ASC;
  const { dni } = req.body;

  try {
    const users = await UserService.getUsers({ page, limit, sort, dni });
    res.status(Status.Correct).json(users);
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al obtener los usuarios.', error: (error as Error).message });
  }
};

export const addPetToUser = async (req: Request, res: Response): Promise<void> => {
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

