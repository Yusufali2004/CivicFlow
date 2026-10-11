import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import incidentRoutes from './routes/incidentRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { seedDatabase } from './seed/seedData.js';
import { Incident } from './models/Incident.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/analytics', analyticsRoutes);

// Database seed endpoint (useful for demo resets)
app.post('/api/seed', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({ success: true, message: 'Database reset & seeded successfully', ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System Health & Connection Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'CIVICFLOW Smart City Hub',
    timestamp: new Date(),
    replicaSetReady: true,
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no incidents yet
    const incidentCount = await Incident.countDocuments();
    if (incidentCount === 0) {
      console.log('Database empty. Automatically populating default smart city seed data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` CIVICFLOW Backend Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
};

startServer();
