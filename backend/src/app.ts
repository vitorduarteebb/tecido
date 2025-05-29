import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config, connectDB } from './config/database';
import routes from './routes';
import path from 'path';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  }); 