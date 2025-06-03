import { Request, Response } from 'express';
import { Status } from '../utils/const/status.js';
import * as PetService from '../services/pet.service.js';
import * as UserService from '../services/user.service.js';
import { SortOrder } from '../utils/const/sortOrder.js';

export const createPet = async (req: Request, res: Response): Promise<void> => {
  const { owner } = req.body;
  const ownerFromParams: string = req.params.uid;

  if (!owner || !ownerFromParams) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  if (owner !== ownerFromParams) {
    res.status(Status.Unauthorized).json({ message: 'Error de permisos' });
    return;
  }

  try {
    const dog = await PetService.createPetService(req.body);

    if(dog) {
      await UserService.addPetToUser(ownerFromParams, dog._id);
    }
    
    res.status(Status.Correct).json({
      message: 'Mascota registrada correctamente',
      dog
    });
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al registrar la mascota',
      error: (error as Error).message
    });
  }
};

export const updatePet = async (req: Request, res: Response): Promise<void> => {
  const { uid, petId } = req.params;
  const { owner, ...petBodyUpdate } = req.body;

  if (!owner) {
    res.status(Status.BadRequest).json({ message: 'Falta el UID del usuario.' });
    return;
  }

  if( owner !== uid) {
    res.status(Status.Unauthorized).json({ message: 'Error de permisos' });
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

export const getPets = async (req: Request, res: Response): Promise<void> => {
  const page: number = Number(req.body.page) || 0;
  const limit: number = Number(req.body.limit) || 10;
  const sort: string = req.body.sort || SortOrder.ASC;
  const { owner } = req.body;

  try {
    const pets = await PetService.getAllPetsService({page, limit, sort, owner});

    res.status(Status.Correct).json(pets);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener los perros',
      error: (error as Error).message
    });
  }
};

export const getPetById = async (req: Request, res: Response): Promise<void> => {
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

export const deletePet = async (req: Request, res: Response): Promise<void> => {
  const { uid, petId } = req.params;

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