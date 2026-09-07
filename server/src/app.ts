import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api', adminRoutes);

// Error handler
app.use(errorHandler);

export default app;
