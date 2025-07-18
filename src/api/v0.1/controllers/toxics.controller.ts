import { AuthenticatedRequest } from "../models/interfaces/authenticatedRequest.js";
import { SortOrder } from "../utils/const/sortOrder.js";
import { Status } from "../utils/const/status.js";
import Toxic from "../models/toxic.model.js";
import * as ToxicService from '../services/toxic.service.js';
import { Response } from "express";


export const getToxics = async(req: AuthenticatedRequest, res: Response): Promise<any> => {
  const page: number = Number(process.env.page);
  const size: number = Number(process.env.ILIMIT_SIZE) ;
  const sort: string = SortOrder.ASC || "";


  try {
    const toxics = await ToxicService.getToxicsService({
      page: Number(page),
      size: Number(size),
      sort: String(sort),
    });

    res.status(Status.Correct).json(toxics);
  } catch (error) {
    res.status(Status.Error).json({
      message: 'Error al obtener los tóxicos',
      error: (error as Error).message
    });
  }
};