import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Seed runner completed successfully.');
  } catch (error) {
    console.error('Seed runner failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
