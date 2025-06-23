import TaskTypes from '../models/taskTypes.model.js';

export async function loadTaskTypes() {
  const initialTaskTypes = [
    { name: 'Paseo', photo: 'paseo.jpg' },
    { name: 'Alimentación', photo: 'alimentacion.jpg' },
    { name: 'Baño', photo: 'bano.jpg' },
    { name: 'Cepillado', photo: 'cepillado.jpg' },
    { name: 'Visita al veterinario', photo: 'veterinario.jpg' },
    { name: 'Corte de uñas', photo: 'uñas.jpg' },
    { name: 'Ejercicio', photo: 'ejercicio.jpg' },
    { name: 'Juego', photo: 'juego.jpg' },
    { name: 'Entrenamiento', photo: 'entrenamiento.jpg' },
    { name: 'Revisión de parásitos', photo: 'parasitos.jpg' },
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
