import { Types } from "mongoose";
import { SterilizedType } from "./sterelized.js";

export interface PetInterface {
    _id: Types.ObjectId;
    owner: Types.ObjectId;
    name: string;
    breed: string;
    photo?: string;
    sex?: 'male' | 'female' | "";
    age?: number;
    weight?: number;
    sterelized?: SterilizedType;
    tasks?: Types.ObjectId[];
};