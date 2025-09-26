import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { getUserId } from './auth';

dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  console.error('Missing CLERK_SECRET_KEY environment variable');
  process.exit(1);
}

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000'
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import clerk middleware and create auth middleware
const clerkMiddleware = ClerkExpressWithAuth({});
const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    clerkMiddleware(req as any, res as any, (err: any) => {
      if (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Health check route (public)
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Protected test route
app.get('/api/me', auth, (req: Request, res: Response) => {
  res.json({ userId: getUserId(req) });
});

// Schedule routes
import scheduleRouter from './schedules/routes';
app.use('/api/schedules', auth, scheduleRouter);

// Role check test routes
app.get('/api/test/patient', auth, (req: Request, res: Response) => {
  const authData = (req as any).auth;
  const role = authData?.sessionClaims?.publicMetadata?.role;
  res.json({ ok: true, role, metadata: authData?.sessionClaims?.publicMetadata });
});

// User routes
import userRouter from './users/routes';
app.use('/api/users', auth, userRouter);

// Start
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || '';

async function start() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


