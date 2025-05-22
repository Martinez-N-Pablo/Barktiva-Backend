// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model.js'; //
import { UserInterface } from '../models/interfaces/user.interface.js';
import hassPassword from '../utils/hassPassword.js';
import validatePassword from '../utils/validatePassword.js';
import { Status } from '../utils/const/status.js';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const {
    name, surname, email, password, repeatPassword, photo, birthdate
  } = req.body;
  const token = req.header('x-token');

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Faltan campos obligatorios.' });
    return;
  }

  const newUser: UserInterface = {
    name,
    surname,
    email,
    password,
    photo,
    birthdate: birthdate ? new Date(birthdate) : undefined,
  };

  try {
    if(!validatePassword(password, repeatPassword)){
      res.status(Status.BadRequest).json({ message: 'Las contraseñas no coinciden.' });
      return;
    }
    console.log('Password coinciden');
    newUser.password = hassPassword(newUser.password);

    const user = await User.create(newUser);

    res.status(Status.Correct).json({ message: 'Usuario creado con éxito.', user: newUser });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al crear el usuario.', error });
    return;
  }
};
