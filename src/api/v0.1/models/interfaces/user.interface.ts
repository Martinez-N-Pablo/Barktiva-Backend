import { Types } from "mongoose";

export interface UserInterface {
  name: string;
  surname?: string;
  email: string;
  email_verified?: boolean;
  password?: string;
  photo?: string;
  birthdate?: Date;
  pets?: Types.ObjectId[];
  tasks?: Types.ObjectId[];
  role?: 'admin' | 'user';
  firebase_uid?: string;
  last_login_at?: Date;
  disabled?: boolean;
  provider?: string;
}