// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import orderRoutes from './routes/orders.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import dealerRoutes from './routes/dealers.js';
import paymentsRouter from './routes/payments.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runRenewalReminders } from './jobs/renewalReminder.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Rate limiting
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 20 }));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dealers', dealerRoutes);
app.use('/api/payments', paymentsRouter);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'AutoNexus API' }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚗 AutoNexus server running on port ${PORT}`);

  // Cron — run renewal reminders daily
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  runRenewalReminders().catch(console.error);
  setInterval(runRenewalReminders, TWENTY_FOUR_HOURS);
});

export default app;