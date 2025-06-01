import { Request, Response } from 'express';
import { User } from '../models/user.model.js';

export const createUser = (req: Request, res: Response) => {
  const {
    id, name, surname, email, password, photo, birthdate, dogs, tasks
  } = req.body;

  if (!id || !name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  const newUser: User = {
    id: String(id),
    name,
    surname,
    email,
    password,
    photo,
    birthdate: birthdate ? new Date(birthdate) : undefined,
    dogs: dogs || [],
    tasks: tasks || []
  };

  return res.status(201).json({ message: 'Usuario creado con éxito.', user: newUser });
};
