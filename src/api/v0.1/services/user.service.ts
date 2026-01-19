import User from '../models/user.model.js';
import { UserInterface } from '../models/interfaces/user.interface.js';
import hashPassword from '../utils/hassPassword.js';
import validatePassword from '../utils/validatePassword.js';
import { verifyCurrentPassword } from '../utils/verifyCurrentPassword.js';
import { PetInterface } from '../models/interfaces/pet.interface.js';
import { ClientSession, Types } from 'mongoose';
import { deleteImageFromStorage } from './firebase.service.js';

interface RegisterInput extends UserInterface {
    confirmPassword: string;
}

interface GetUsersOptions {
    page: number;
    size: number;
    sort: string;
    dni?: string;
}

export const registerUser = async (input: RegisterInput) => {
    const { password, confirmPassword, email, ...rest } = input;

    if(!password || !confirmPassword) {
        throw new Error('La contraseña y la confirmación de la contraseña son obligatorias.');
    }
    
    if (!validatePassword(password, confirmPassword)) {
        throw new Error('Las contraseñas no coinciden.');
    }

    //Check if exits another user with the same email
    const existingUser = await User.findOne({ email });

    const hashed: string = hashPassword(password);

    const newUser: UserInterface = {
        ...rest,
        email,
        password: hashed,
        birthdate: input.birthdate ? new Date(input.birthdate) : undefined
    };

    const user = await User.create(newUser);
    return user;
};

export const updateUser = async (id: string, updates: any) => {
    const ALLOWED_FIELDS = ['name', 'surname', 'email', 'photo', 'birthdate']; // Campos modificables
    
    // Check if the user exists by ID
    const user = await findUserById(id);

    if (!user) {
        throw new Error('Usuario no encontrado.');
    }

    // Filtrar solo los campos que se permiten actualizar
    for (const key of Object.keys(updates)) {
        if (ALLOWED_FIELDS.includes(key)) {
            (user as any)[key] = updates[key]; // Comprobar que FUNCIONA
        }
    }

    await user.save();
    return user;
};

export const changeUserPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
) => {
    const user = await findUserById(userId);

    await verifyCurrentPassword(user, currentPassword);

    validatePassword(newPassword, confirmPassword);

    user.password = hashPassword(newPassword);
    await user.save();
};

const findUserById = async (id: string, session?: ClientSession) => {
    const query = User.findById(id).select('-password');;
    
    // Si hay sesion, la aplicamos
    if (session) {
        query.session(session);
    }

    const user = await query;

    if (!user) throw new Error('Usuario no encontrado.');

    return user;
};

export const getUserById = async (id: string) => {
    const user = await User.findById(id)
        .select('-password')
        .populate("pets", "_id name")
        .populate("tasks", "_id name"); // Menos password
    if (!user) throw new Error('Usuario no encontrado.');
    return user;
};

export const deleteUser = async (id: string) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error('Usuario no encontrado o ya eliminado.');

    if(user.photo) {
      await deleteImageFromStorage(user.photo);  
    }

    return user;
};

export const getUsers = async ({ page, size, sort, dni }: GetUsersOptions) => {
  const skip = (page - 1) * size;

  const query: Record<string, any> = {};
  if (dni) query.dni = dni;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ name: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(size),
    User.countDocuments(query)
  ]);

  return {
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
    users
  };
};

export const addPetToUser = async (userId: string, petId: Types.ObjectId, session?: ClientSession) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error('Usuario no encontrado.');
    }

    if (!user.pets) {
        user.pets = [];
    }

    if (!user.pets.includes(petId)) {
        user.pets.push(petId);
    }

    await user.save({session});
    
    return user;
}

export const removePetFromUser = async (userId: string, petId: Types.ObjectId) => {
    const user = await findUserById(userId);
    
    if (!user.pets) {
        throw new Error('El usuario no tiene mascotas.');
    }

    user.pets = user.pets.filter((pet: Types.ObjectId) => pet.toString() !== petId.toString());
    await user.save();
    
    return user;
}

export const addTaskToUser = async (userId: string, taskId: Types.ObjectId, session: ClientSession) => {
    const user = await findUserById(userId);
    
    if (!user.tasks) {
        user.tasks = [];
    }

    user.tasks.push(taskId);
    await user.save({ session });
    
    return user;
}

export const removeTaskFromUser = async (userId: string, taskId: Types.ObjectId, session: ClientSession) => {
    const user = await findUserById(userId, session);
    
    if (!user.tasks) {
        throw new Error('El usuario no tiene tareas.');
    }

    user.tasks = user.tasks.filter((task: Types.ObjectId) => task.toString() !== taskId.toString());
    await user.save({session});
    
    return user;
};