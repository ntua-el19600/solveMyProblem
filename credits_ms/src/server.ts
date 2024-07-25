import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import creditRoutes from './routes/creditRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/credits', creditRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Credit microservice is running');
});

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
