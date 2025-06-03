import { Types } from "mongoose";
import Task from "../models/task.model.js";
import { TaskInterface } from "../models/interfaces/task.interface.js";

interface GetTaskInterface {
    page: number;
    size: number;
    sort: string;
    user?: Types.ObjectId | string;
    pets?: Types.ObjectId[];
};

export const createTaskService = async (taskData: any) => {
    return await Task.create(taskData);
};

export const getTaskByIdService = async (ownerId: string): Promise<any> => {
    return await Task.findById(ownerId)
        .populate('user', 'name surname email')
        .populate({
            path: 'pets', // Si es un array de ObjectId se hace asi
            select: 'name'
        });
};

export const deleteTaskService = async (taskId: string, owner: string) => {
    const task = await Task.findById(taskId);
    if (!task) {
        throw new Error('Tarea no encontrada.');
    }

    if (task.user.toString() !== owner) {
        throw new Error('No tienes permiso para eliminar esta tarea.');
    }

    await task.deleteOne();
    return task;
};

export const updateTaskService = async (taskId: string, updates: any): Promise<TaskInterface> => {
    const NOT_ALLOWED_FIELDS = ['owner', 'uid']; // Campos NO modificables

    const task = await getTaskByIdService(taskId);

    if (!task) {
        throw new Error('Tarea no encontrado.');
    }
    
    // Filtrar solo los campos que se permiten actualizar
    for (const key of Object.keys(updates)) {
        if (!NOT_ALLOWED_FIELDS.includes(key)) {
            (task as any)[key] = updates[key];
        }
    }

    await task.save();
    return task;
};

export const getTasksService = async ({ page, size, sort, user, pets }: GetTaskInterface) => {
    const skip = (page - 1) * size;

    const query: Record<string, any> = {};
    if (user) query.owner = user;
    if (pets && pets.length > 0) query.pets = { $in: pets };

    const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort({ name: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(size)
      .populate('user', 'name surname email')
      .populate({
        path: 'pets',
        select: 'name'
      }),
    Task.countDocuments(query)
  ]);

    return {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
        tasks
    };
};