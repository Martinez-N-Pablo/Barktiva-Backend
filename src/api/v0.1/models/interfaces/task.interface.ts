// src/models/interfaces/task.interface.ts
import { Types } from 'mongoose';

export interface TaskInterface {
  user: Types.ObjectId;
  pets: Types.ObjectId[];
  taskType: string;
  name: string;
  photo?: string;
  dosesTime?: string; // day week month
  dosesPerDay?: number;
  dosesPerWeek?: number;
  dosesPerMonth?: number;
  notification?: boolean;
  quantity?: number;
  routeAdministration?: string;
  initialDate: Date;
  finalDate?: Date;
  description?: string;
}