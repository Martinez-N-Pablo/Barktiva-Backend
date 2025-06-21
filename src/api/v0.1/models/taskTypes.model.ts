import mongoose from "mongoose";
import { TaskTypesInterface } from "./interfaces/taskTypes.js";

const TaskTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
});

export default mongoose.model<TaskTypesInterface & Document>('TaskTypes', TaskTypeSchema);