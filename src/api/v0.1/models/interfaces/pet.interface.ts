import { Types } from "mongoose";

export interface PetInterface {
    userId: Types.ObjectId;
    name: string;
    breed: string;
    photo?: string;
    sex?: 'male' | 'female';
    age?: number;
    weight?: number;
    castrated?: boolean;
    tasks?: Types.ObjectId[];
};