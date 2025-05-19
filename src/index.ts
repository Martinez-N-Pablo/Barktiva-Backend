import 'dotenv/config';
import express from 'express';
import cors from 'cors';
//Import database
import { connectDB } from './api/v0.1/datebase/configdb.js';

//Frameworks
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

/**
 * Redirije de manera dinamica todas las rutas
 * IMPORTANTE: NO HACE FALTA AÑADIR NINGUNA RUTA NUEVA
 */
import router from './api/v0.1/routes/index.js';
app.use('/api', router);

app.listen(process.env.PORT, () => {
    console.log(`Backend running on PORT: ${process.env.PORT}`);
})
