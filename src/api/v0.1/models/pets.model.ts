import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
  userId: {
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

const Pet = mongoose.model('Pet', PetSchema);
export default Pet;
