import mongoose from 'mongoose';
import { TaskInterface } from './interfaces/task.interface.js';

const TaskSchema = new mongoose.Schema<TaskInterface & Document>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    }
  ],

  taskType: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'TaskTypes',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  dosesTime: {
    type: String,
    enum: ['day', 'week', 'month'],
    default: 'day'
  },

  dosePerDay: {
    type: Number
  },

  dosePerWeek: {
    type: Number
  },

  dosePerMonth: {
    type: Number
  },

  notification: {
    type: Boolean
  },

  quantity: {
    type: Number
  },

  routeAdministration: {
    type: String
  },

  hourDosis: {
    type: String,
    required: true
  },
  initialDate: {
    type: Date,
    required: true
  },

  finalDate: {
    type: Date,
    required: true
  },

  description: {
    type: String
  }
});

const Task = mongoose.model<TaskInterface & Document>('Task', TaskSchema);
export default Task;
