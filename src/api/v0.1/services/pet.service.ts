import { ClientSession, Types } from "mongoose";
import { PetInterface } from "../models/interfaces/pet.interface.js";
import Pet from '../models/pets.model.js';
import { deleteImageFromStorage, uploadImageToStorage } from "./firebase.service.js";

interface GetPetsInterface {
    page: number;
    size: number;
    sort: string;
    owner?: Types.ObjectId | string;
};

export const createPetService = async (petData: PetInterface, session: ClientSession) => {
    const newPet: PetInterface = petData;
    return await Pet.create([newPet], {session});
};

export const updatePetService = async (petId: string, updates: any): Promise<PetInterface> => {
    const NOT_ALLOWED_FIELDS = ['owner', 'uid']; // Campos NO modificables

    const pet = await getPetById(petId);

    if (!pet) {
        throw new Error('Mascota no encontrada.');
    }

    if (updates.photoFile) {
      if (pet.photo) { // si ya tenia una foto almacenada, la mandamos eliminar del firebase storage
        await deleteImageFromStorage(pet.photo);
      }

      const newFileName = `pets/${pet._id}_${Date.now()}.jpg`;
      const imageUrl = await uploadImageToStorage(updates.photoFile, newFileName);
      
      pet.photo = imageUrl;
    }
    
    // Filtrar solo los campos que se permiten actualizar
    for (const key of Object.keys(updates)) {
        if (!NOT_ALLOWED_FIELDS.includes(key)) {
            (pet as any)[key] = updates[key]; // Comprobar que FUNCIONA
        }
    }

    await pet.save();
    return pet;
};

export const getAllPetsService = async ({ page, size, sort, owner }: GetPetsInterface) => {
  const skip = (page - 1) * size;

  const query: Record<string, any> = {};
  if (owner) query.owner = owner;

  const [pets, total] = await Promise.all([
    Pet.find(query)
      .sort({ name: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(size)
      .populate('owner', 'name surname email'),
    Pet.countDocuments(query)
  ]);

  return {
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
    pets
  };
};

export const getPetById = async (petId: string, session?: ClientSession) => {
    return await Pet.findById(petId).populate('owner', 'name surname email').session(session || null);
};

export const deletePetService = async (petId: string, owner: string) => {
    const pet = await Pet.findById(petId);

  if (!pet) {
    throw new Error('Mascota no encontrada.');
  }

  if (pet.owner.toString() !== owner) {
    throw new Error('No tienes permiso para eliminar esta mascota.');
  }

  await pet.deleteOne();
  return pet;
};

export const addTaskToPet = async (petId: string, taskId: Types.ObjectId, session?: ClientSession) => {
    const pet = await getPetById(petId);

    if (!pet) {
      throw new Error('Mascota no encontrada.');
    }
    
    if (!pet.tasks) {
      pet.tasks = [];
    }

    if(!pet.tasks.includes(taskId)) {
      pet.tasks.push(taskId);
    }

    await pet.save({session});
    return pet;
};

export const removeTaskFromPet = async (petId: string, taskId: string, session: ClientSession) => {
    const pet = await getPetById(petId, session);

    if (!pet) {
        throw new Error('Mascota no encontrada.');
    }

    if (!pet.tasks) {
        throw new Error('La mascota no tiene tareas asignadas.');
    }

    pet.tasks = pet.tasks.filter((task: Types.ObjectId) => task.toString() !== taskId.toString());
    await pet.save({session});
    
    return pet;
};