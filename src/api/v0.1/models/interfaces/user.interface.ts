import { Types } from "mongoose";

export interface UserInterface {
  name: string;
  surname?: string;
  email: string;
  password: string;
  photo?: string;
  birthdate?: Date;
  pets?: Types.ObjectId[];
  tasks?: Types.ObjectId[];
  role?: 'admin' | 'user';
}