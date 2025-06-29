import mongoose from 'mongoose';
import { loadTaskTypes } from '../utils/loadTaskTypes.js';
import { loadBreedsFromAPI } from '../utils/loadBreeds.js';

const connectionString: string | undefined = process.env.DBCON || "";

if (!connectionString) {
  throw new Error('La variable de entorno DBCON no está definida');
}

console.log(connectionString);

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(connectionString || "");
    console.log(' Conectado a MongoDB correctamente');

    await loadTaskTypes();
    await loadBreedsFromAPI();
  } catch (error) {
    console.error(' Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}