import { Request, Response } from 'express';
import { Status } from '../utils/const/status.js';
import * as PetService from '../services/pet.service.js';
import * as UserService from '../services/user.service.js';
import { SortOrder } from '../utils/const/sortOrder.js';
import { AuthenticatedRequest } from '../models/interfaces/authenticatedRequest.js';
import mongoose, { ClientSession } from 'mongoose';
import { deleteImageFromStorage, uploadImageToStorage } from '../services/firebase.service.js';
import * as TaskService from '../services/task.service.js';
import { Types } from 'mongoose';
import { SterilizedValue } from '../models/interfaces/sterelized.js';

export const createPet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const owner: string = req.uid || "";
  const { ...petBody } = req.body;
  const photo = req.body.photo;

  if (!owner) {
    res.status(Status.BadRequest).json({ message: 'Falta el identificador del usuario.' });
    return;
  }

  if (Types.ObjectId.isValid(petBody.breed)) {
    petBody.breed = new Types.ObjectId(petBody.breed);
  } else {
    throw new Error("El ID de la raza no es válido");
  }

  petBody.owner = owner;

  console.log(SterilizedValue);
  console.log("Llega:")
  console.log(petBody);
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    const [pet] = await PetService.createPetService(petBody, session);
      console.log("controller tras create")

     if(!pet) {
      await session.abortTransaction();
      session.endSession();
    }

    if (req.file) {
      if (photo) { // si ya tenia una foto almacenada, la mandamos eliminar del firebase storage
        await deleteImageFromStorage(photo);
      }

      const newFileName = `pets/${pet._id}_${Date.now()}.jpg`;
      const imageUrl = await uploadImageToStorage(req.file, newFileName);
      
      pet.photo = imageUrl;
      await pet.save({ session });
    }
    
    await UserService.addPetToUser(owner, pet._id, session);
    
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

  petBodyUpdate.breed = new mongoose.Types.ObjectId(req.body.breed);

  try {
    if (req.file) {
      petBodyUpdate.photoFile = req.file;
    }
    
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
  const { petId } = req.params;

  try {
    const pet = await PetService.getPetByIdService(petId);

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pet = await PetService.deletePetService(petId, uid, session);

    if(!pet) {
      await session.abortTransaction();
      res.status(Status.NotFound).json({ message: 'Tarea no encontrada' });
      return;
    }

    await UserService.removePetFromUser(pet.owner.toString(), pet._id);

    if(pet.tasks) {
      for(const task of pet.tasks) {
        await TaskService.removePetFromTask(task._id.toString(), pet._id, session, uid);
      }
    }
    
    await session.commitTransaction();
    res.status(Status.Correct).json({ message: 'Mascota eliminada con éxito.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(Status.Error).json({ message: 'Error al eliminar la mascota.', error: (error as Error).message });
  } finally {
    session.endSession();
  }
};

export const getBreeds = async(req: AuthenticatedRequest, res: Response) => {
  const page: number = Number(process.env.page);
  const size: number = Number(process.env.ILIMIT_SIZE) || 30;;
  const sort: string = SortOrder.ASC || "";

  try {
    const pets = await PetService.getPetsBreedsService({
      page: Number(page),
      size: Number(size),
      sort: String(sort),
    });

    res.status(Status.Correct).json(pets);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener las razas de perro',
      error: (error as Error).message
    });
  }
};