import { Types } from "mongoose";

export interface PetInterface {
    _id: Types.ObjectId;
    owner: Types.ObjectId;
    name: string;
    breed: string;
    photo?: string;
    sex?: 'male' | 'female' | "";
    age?: number;
    weight?: number;
    castrated?: 'c' | 's' | "";
    tasks?: Types.ObjectId[];
};