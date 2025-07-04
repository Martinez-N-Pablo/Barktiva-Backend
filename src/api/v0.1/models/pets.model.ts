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
    type: mongoose.Schema.Types.Mixed,
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
    type: String,
    enum: ['c', 's', ''],
    default: 'c'
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

export default mongoose.model<PetInterface & Document>('Pet', PetSchema);
