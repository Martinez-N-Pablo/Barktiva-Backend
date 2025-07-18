import Breed from "../models/breed.model.js";
import axios from "axios";
import { BreedsDogApi } from "../models/interfaces/breedsDogApi.js";

export async function loadBreeds() {
  const initialBreeds = [
    { name: 'Labrador Retriever', photo: 'labrador.jpg' },
    { name: 'Golden Retriever', photo: 'golden.jpg' },
    { name: 'Pastor Alemán', photo: 'pastor_aleman.jpg' },
    { name: 'Bulldog Francés', photo: 'bulldog_frances.jpg' },
    { name: 'Beagle', photo: 'beagle.jpg' },
    { name: 'Poodle', photo: 'poodle.jpg' },
    { name: 'Rottweiler', photo: 'rottweiler.jpg' },
    { name: 'Yorkshire Terrier', photo: 'yorkshire.jpg' },
    { name: 'Dóberman', photo: 'doberman.jpg' },
    { name: 'Boxer', photo: 'boxer.jpg' },
    { name: 'Chihuahua', photo: 'chihuahua.jpg' },
    { name: 'Shih Tzu', photo: 'shihtzu.jpg' },
    { name: 'Border Collie', photo: 'bordercollie.jpg' },
    { name: 'Siberian Husky', photo: 'husky.jpg' },
    { name: 'Gran Danés', photo: 'gran_danes.jpg' },
    { name: 'Mastín', photo: 'mastin.jpg' },
    { name: 'Cocker Spaniel', photo: 'cocker.jpg' },
    { name: 'San Bernardo', photo: 'san_bernardo.jpg' },
    { name: 'Akita Inu', photo: 'akita.jpg' },
    { name: 'Dálmata', photo: 'dalmata.jpg' },
    { name: 'Pomerania', photo: 'pomerania.jpg' },
    { name: 'Boston Terrier', photo: 'boston_terrier.jpg' },
    { name: 'Basset Hound', photo: 'basset.jpg' },
    { name: 'Cane Corso', photo: 'cane_corso.jpg' },
    { name: 'Pug', photo: 'pug.jpg' },
    { name: 'Staffordshire Bull Terrier', photo: 'staffordshire.jpg' },
    { name: 'Galgo', photo: 'galgo.jpg' },
    { name: 'Shar Pei', photo: 'sharpei.jpg' },
    { name: 'Habanero', photo: 'bichon_habanero.jpg' },
  ];

  // Actualizar uno por uno las razas de perro
  for (const breed of initialBreeds) {
    await Breed.updateOne(
      { name: breed.name },
      { $set: { photo: breed.photo } },
      { upsert: true }
    );
  }
  
  // Limpieza: eliminar los que ya no están en initialTaskTypes
  const validNames = initialBreeds.map(b => b.name);
  await Breed.deleteMany({ name: { $nin: validNames } });

  console.log('Razas de perro sincronizadas correctamente');
}

/**
 * 
 * {
      weight: [Object],
      height: [Object],
      id: 29,
      name: 'Basset Bleu de Gascogne',
      bred_for: 'Hunting on foot.',
      breed_group: 'Hound',
      life_span: '10 - 14 years',
      temperament: 'Affectionate, Lively, Agile, Curious, Happy, Active',
      reference_image_id: 'BkMQll94X',
      image: [Object]
    }
 */
export async function loadBreedsFromAPI() {
  try {
    const res = await axios.get('https://api.thedogapi.com/v1/breeds?limit=30', {
      headers: {
        'x-api-key': process.env.X_API_KEY || ""
      }
    });

    if(!res) {
      console.log("Error al obtener las razas de perro de la api");
      return;
    }

    const breeds: BreedsDogApi[] = res.data as BreedsDogApi[];

    const formattedBreeds = breeds.map((breed:BreedsDogApi) => ({
      name: breed.name,
      photo: breed.image?.url || '',
    }));

    for (const breed of formattedBreeds) {
      await Breed.updateOne(
        { name: breed.name },
        { $set: { photo: breed.photo } },
        { upsert: true }
      );
    }

    const validNames = formattedBreeds.map(b => b.name);
    await Breed.deleteMany({ name: { $nin: validNames } });

    console.log('Razas sincronizadas desde TheDogAPI');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error al cargar razas desde TheDogAPI:', err.message);
    } else {
      console.error('Error desconocido al cargar razas desde TheDogAPI:', err);
    }
  }
}
