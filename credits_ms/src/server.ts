import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import creditRoutes from './routes/creditRoutes';
import { connectRabbitMQ } from './utils/rabbitmq';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/credits', creditRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Credit microservice is running');
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await connectRabbitMQ(); // Connect to RabbitMQ before starting the server

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1); // Exit the process if there was an error
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  // You can add RabbitMQ disconnect logic here if necessary
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
startServer();
