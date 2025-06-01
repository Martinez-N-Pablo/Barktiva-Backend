import mongoose from 'mongoose';

const connectionString: string | undefined = process.env.DBCON || "";

if (!connectionString) {
  throw new Error('La variable de entorno DBCON no está definida');
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(connectionString || "");
    console.log(' Conectado a MongoDB correctamente');
  } catch (error) {
    console.error(' Error al conectar a MongoDB:', error);
    process.exit(1);
  }
}