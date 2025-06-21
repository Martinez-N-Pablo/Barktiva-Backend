import { Request, Response } from 'express';
import { Status } from '../utils/const/status.js';
import * as PetService from '../services/pet.service.js';
import * as UserService from '../services/user.service.js';
import { SortOrder } from '../utils/const/sortOrder.js';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';
import mongoose from 'mongoose';

export const createPet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const owner: string = req.uid || "";

  if (!owner) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  req.body.owner = owner;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [pet] = await PetService.createPetService(req.body, session);

    if(!pet) {
      await session.abortTransaction();
      session.endSession();
    }

    if(pet) {
      await UserService.addPetToUser(owner, pet._id, session);
    }

    await session.commitTransaction();
    res.status(Status.Correct).json({
      message: 'Mascota registrada correctamente',
      pet
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(Status.Error).json({
      message: 'Error al registrar la mascota',
      error: (error as Error).message
    });
  } finally {
    session.endSession();
  }
};

export const updatePet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { petId } = req.params;
  const { ...petBodyUpdate } = req.body;
  const owner: string = req.uid || "";

  if (!owner) {
    res.status(Status.BadRequest).json({ message: 'Falta el UID del usuario.' });
    return;
  }

  try {
    const updatedPet = await PetService.updatePetService(petId, petBodyUpdate);

    if (!updatedPet) {
      res.status(Status.NotFound).json({ message: 'Mascota no encontrada' });
      return;
    }

    res.status(Status.Correct).json({
      message: 'Mascota actualizada correctamente',
      updatedPet
    });
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al actualizar la mascota',
      error: (error as Error).message
    });
  }
};

export const getPets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page: number = Number(req.body.page) || 1;
  const size: number = Number(req.body.size) || 10;
  const sort: string = req.body.sort || SortOrder.ASC;
  const owner: string = req.uid || "";

  try {
    const pets = await PetService.getAllPetsService({page, size, sort, owner});

    res.status(Status.Correct).json(pets);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener los perros',
      error: (error as Error).message
    });
  }
};

export const getPetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const pet = await PetService.getPetById(id);

    if (!pet) {
      res.status(Status.NotFound).json({ message: 'Mascota no encontrada' });
      return;
    }
    
    res.status(Status.Correct).json(pet);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener la mascota',
      error: (error as Error).message
    });
  }
};

export const deletePet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { petId } = req.params;
  const uid: string = req.uid || "";

  try {
    const pet = await PetService.deletePetService(petId, uid);

    if(pet) {
      await UserService.removePetFromUser(pet.owner.toString(), pet._id);
    }
    res.status(Status.Correct).json({ message: 'Mascota eliminada con éxito.' });
  } catch (error) {
    res.status(Status.Error).json({ message: 'Error al eliminar la mascota.', error: (error as Error).message });
  }
};