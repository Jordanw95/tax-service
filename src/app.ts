import express, { Request, Response } from 'express';
import routes from './routes';
// Required for class-transfomer
import 'reflect-metadata';

const app = express();

app.use(express.json());

app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, From Novabook!');
});

export default app;
