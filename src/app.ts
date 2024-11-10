import express, { Request, Response } from 'express';
import routes from './routes';
// Required for class-transfomer
import 'reflect-metadata';
import { errorHandler } from './utils/errorHandler';
const app = express();

app.use(express.json());
app.use('/api', routes);

app.use(errorHandler);

export default app;
