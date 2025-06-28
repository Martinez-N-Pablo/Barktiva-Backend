import TaskTypes from '../models/taskTypes.model.js';

export async function loadTaskTypes() {
  const initialTaskTypes = [
    { name: 'Paseo', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Fperro-caminando.png?alt=media&token=f992ea56-3b76-408b-80fa-72a600bc7741' },
    { name: 'Alimentación', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Fcomida-de-perro.png?alt=media&token=70d075ee-9a50-40d4-9b4a-1ab355405ae2' },
    { name: 'Baño', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Fducha.png?alt=media&token=bc60bcf4-0126-4ed6-aae4-d221441ed79f' },
    { name: 'Estética', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Festrella.png?alt=media&token=0ac92778-3b13-4d73-8f01-39a030745072' },
    { name: 'Visita al veterinario', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Fveterinario.png?alt=media&token=139a3005-6cd9-4139-914f-880f09ac690a' },
    { name: 'Ejercicio', photo: 'https://firebasestorage.googleapis.com/v0/b/barktiva-b35a6.firebasestorage.app/o/icons%2Fentrenamiento-canino.png?alt=media&token=ce7076cf-1554-4967-a357-a616b89bffb4' },
  ];

  // Actualizar uno por uno los tipos
  for (const task of initialTaskTypes) {
    await TaskTypes.updateOne(
      { name: task.name },
      { $set: { photo: task.photo } },
      { upsert: true }
    );
  }

  // Limpieza: eliminar los que ya no están en initialTaskTypes
  const validNames = initialTaskTypes.map(t => t.name);
  await TaskTypes.deleteMany({ name: { $nin: validNames } });

  console.log('Tipos de tareas sincronizados correctamente');
}
