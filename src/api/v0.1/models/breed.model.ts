import mongoose from "mongoose";
import { BreedInterface } from "./interfaces/breed.interface.js";

const BreedSchema = new mongoose.Schema<BreedInterface & Document>({
  name: { type: String, required: true },
  photo: { type: String, required: true },
});

export default mongoose.model<BreedInterface & Document>('Breed', BreedSchema);