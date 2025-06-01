import { Types } from "mongoose";

export interface PetInterface {
    owner: Types.ObjectId;
    name: string;
    breed: string;
    photo?: string;
    sex?: 'male' | 'female';
    age?: number;
    weight?: number;
    castrated?: boolean;
    tasks?: Types.ObjectId[];
};