import mongoose from 'mongoose';
import { PetInterface } from './interfaces/pet.interface.js';

const PetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  breed: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  sex: {
    type: String
  },

  age: {
    type: Number
  },

  weight: {
    type: Number
  },

  castrated: {
    type: Boolean
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

export default mongoose.model<PetInterface & Document>('Pet', PetSchema);
