import Breed from "../models/breed.model.js";

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
