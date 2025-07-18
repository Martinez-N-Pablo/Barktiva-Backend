import mongoose from "mongoose";
import { ToxicInterface } from "./interfaces/toxic.interface.js";

const ToxicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
});

export default mongoose.model<ToxicInterface & Document>('Toxic', ToxicSchema);