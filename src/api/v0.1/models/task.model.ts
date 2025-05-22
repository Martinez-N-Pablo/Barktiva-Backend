import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },

  taskType: {
    type: String,
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
    type: Number
  },

  dosesPerDay: {
    type: Number
  },

  dosesPerWeek: {
    type: Number
  },

  dosesPerMonth: {
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

  initialDate: {
    type: Date
  },

  finalDate: {
    type: Date
  },

  description: {
    type: String
  }
});

const Task = mongoose.model('Task', TaskSchema);
export default Task;
