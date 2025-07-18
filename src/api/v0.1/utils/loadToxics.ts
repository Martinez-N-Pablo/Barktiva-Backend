import Toxic from '../models/toxic.model.js';

export async function loadToxic() {
    const toxicFoods = [
        {
            name: "Chocolate",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fchocolate.jpg?alt=media&token=0d0e3b68-fafe-4003-b659-075d9e53e4d5"
        },
        {
            name: "Caramelos y chicles con xilitol",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fcaramelos.jpg?alt=media&token=0623ec5b-8b27-4ef7-9f34-a7111aeebbdc"
        },
        {
            name: "Cebollas",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fcebollas.jpg?alt=media&token=6d94df0b-06c1-4104-bc43-c2627aecc590"
        },
        {
            name: "Ajos",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fajos.jpg?alt=media&token=a28afc76-9c96-418b-99da-ff5a99d08938"
        },
        {
            name: "Uvas",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fuvas.jpg?alt=media&token=800f7a57-2720-4d85-9b26-60fe40e8e1fc"
        },
        {
            name: "Pasas",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fpasas.jpg?alt=media&token=2ea959f6-032a-42cc-833f-3f7da38c54b9"
        },
        {
            name: "Aguacate",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Faguacates.jpg?alt=media&token=9bc1fa98-580f-4158-b08b-bf01dea7651a"
        },
        {
            name: "Nueces de macedamia",
            photo: "https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/toxics%2Fnueces_macedamia.jpg?alt=media&token=272df41a-24b4-4015-92be-27b4638aace9"
        },
    ];

  // Actualizar uno por uno los toxicos
  for (const toxic of toxicFoods) {
    await Toxic.updateOne(
      { name: toxic.name },
      { $set: { photo: toxic.photo } },
      { upsert: true }
    );
  }

  // Limpieza: eliminar los que ya no están en initialToxic
  const validNames = toxicFoods.map(t => t.name);
  await Toxic.deleteMany({ name: { $nin: validNames } });

  console.log('Tóxicos sincronizados correctamente.');
}
