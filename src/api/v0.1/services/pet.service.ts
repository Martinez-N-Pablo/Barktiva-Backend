import { Types } from "mongoose";
import { PetInterface } from "../models/interfaces/pet.interface.js";
import Pet from '../models/pets.model.js';

interface GetPetsInterface {
    page: number;
    limit: number;
    sort: string;
    owner?: Types.ObjectId | string;
}

export const createPetService = async (petData: PetInterface) => {
    const newPet: PetInterface = petData;

    return await Pet.create(newPet);
};

export const updatePetService = async (id: string, updates: any) => {
    const ALLOWED_FIELDS = ['owner', 'uid']; // Campos NO modificables

    console.log('ID de la mascota a actualizar:', id);

    const pet = await getPetById(id);

    if (!pet) {
        throw new Error('Usuario no encontrado.');
    }

    console.log('Mascota encontrada:', pet);
    
    // Filtrar solo los campos que se permiten actualizar
    for (const key of Object.keys(updates)) {
        if (!ALLOWED_FIELDS.includes(key)) {
            (pet as any)[key] = updates[key]; // Comprobar que FUNCIONA
        }
    }

    await pet.save();
    return pet;
};

export const getAllPets = async ({ page, limit, sort, owner }: GetPetsInterface) => {
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (owner) query.owner = owner;

  const [pets, total] = await Promise.all([
    Pet.find(query)
      .sort({ name: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name surname email'),
    Pet.countDocuments(query)
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    pets
  };
};

export const getPetById = async (ownerId: string) => {
    return await Pet.findById(ownerId).populate('owner', 'name surname email');
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