import mongoose from 'mongoose';
import { loadTaskTypes } from '../utils/loadTaskTypes.js';
import { loadBreedsFromAPI } from '../utils/loadBreeds.js';
import { ServerApiVersion } from 'mongodb';

const connectionString: string | undefined = process.env.DBCON || "";

if (!connectionString) {
  throw new Error('La variable de entorno DBCON no está definida');
}

export async function connectDB(): Promise<void> {
  try {
    const options = {
      serverApi: {
        version: ServerApiVersion.v1, // Version estable de la API
        strict: true,
        deprecationErrors: true,
      },
    };

    await mongoose.connect((connectionString || ""), options);
    
    console.log(' Conectado a MongoDB correctamente');

    await loadTaskTypes();
    await loadBreedsFromAPI();
  } catch (error) {
    console.error(' Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}