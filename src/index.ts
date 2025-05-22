import 'dotenv/config';
import express from 'express';
import cors from 'cors';
//Import database
import { connectDB } from './api/v0.1/datebase/configdb.js';
import router from './api/v0.1/routes/index.js';
import routerUser from './api/v0.1/routes/user.js';
//Frameworks
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

/**
 * Redirije de manera dinamica todas las rutas
 * IMPORTANTE: NO HACE FALTA AÑADIR NINGUNA RUTA NUEVA
 */
app.use('/api', router);
// app.use('/api/user', routerUser);

app.listen(process.env.PORT, () => {
    console.log(`Backend running on PORT: ${process.env.PORT}`);
})
