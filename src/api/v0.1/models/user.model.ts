import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { Roles } from '../utils/const/roles.js';

const UserSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  surname: {
    type: String
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  birthdate: {
    type: Date
  },

  pets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    }
  ],

  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
  ],
  role: {
    type: String,
    enum: Roles,
    default: Roles.user
  }
});

const User = mongoose.model('User', UserSchema);
export default User;