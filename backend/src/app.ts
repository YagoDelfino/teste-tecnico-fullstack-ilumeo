// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mainRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', mainRoutes);


app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Recurso não encontrado. Verifique a URL da requisição.' });
});

export default app;