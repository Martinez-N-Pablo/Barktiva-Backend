import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { Roles } from '../utils/const/roles.js';
import { UserInterface } from './interfaces/user.interface.js';

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

  email_verified: {
    type: Boolean,
    default: false
  },

  password: {
    type: String,
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
  },

  firebase_uid: {
    type: String,
    unique: true,
    sparse: true
  },

  last_login_at: {
    type: Date,
  },
  
  disabled: {
    type: Boolean,
    default: false
  },

  provider: {
    type: String,
    enum: ['local', 'google.com'],
    default: 'local'
  }
});

export default mongoose.model<UserInterface & Document>('User', UserSchema);