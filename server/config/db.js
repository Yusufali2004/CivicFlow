import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSetInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to MongoDB Atlas / configured URI...');
      await mongoose.connect(mongoUri);
      console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}`);
    } else {
      console.log('No MONGODB_URI found in environment. Initializing MongoMemoryReplSet for local replica set transactions...');
      replSetInstance = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: 'wiredTiger' },
      });
      mongoUri = replSetInstance.getUri();
      console.log(`In-memory replica set ready at ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('Connected to In-Memory Replica Set (Multi-document transactions fully enabled)');
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (replSetInstance) {
    await replSetInstance.stop();
  }
};
