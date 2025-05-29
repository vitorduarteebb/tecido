import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tecidos',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  port: process.env.PORT || 3001
};

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default config; 