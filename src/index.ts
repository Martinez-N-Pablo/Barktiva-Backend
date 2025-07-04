import 'dotenv/config';
import express from 'express';
import cors from 'cors';
//Import database
import { connectDB } from './api/v0.1/datebase/configdb.js';
import router from './api/v0.1/routes/index.js';
import routerUser from './api/v0.1/routes/user.js';
import routerPet from './api/v0.1/routes/pet.js';
import routerAuth from './api/v0.1/routes/auth.js';
import routerTask from './api/v0.1/routes/task.js';

//Frameworks
const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

/**
 * Redirije de manera dinamica todas las rutas
 * IMPORTANTE: NO HACE FALTA AÑADIR NINGUNA RUTA NUEVA
 */
// app.use('/api', router);
app.use('/api/user', routerUser);
app.use('/api/pet', routerPet);
app.use('/api/auth', routerAuth);
app.use('/api/task', routerTask);

app.listen(process.env.PORT, () => {
    console.log(`Backend running on PORT: ${process.env.PORT}`);
});
