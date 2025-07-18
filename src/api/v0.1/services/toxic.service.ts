import Toxic from "../models/toxic.model.js";

interface GetToxicInterface {
    page: number;
    size: number;
    sort: string;
}

export const getToxicsService = async ({ page, size, sort }: GetToxicInterface): Promise<any> => {
    const [toxics, total] = await Promise.all([
        Toxic.find({})
        .sort({ name: sort === 'asc' ? 1 : -1 })
        .limit(size),
        Toxic.countDocuments({})
    ]);
    
    return {
        total,
        page,
        size,
        toxics
    };
};