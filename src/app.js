import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redisClient from './utils/redis.js';
import userRoutes from './routers/user/index.js'
import adminRoutes from './routers/admin/index.js'


dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    "https://ak99.in",
    "https://www.ak99.in",
    "http://localhost:7000",
    "http://localhost:4200",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);


app.get('/', async (req, res) => {
  let redisStatus = 'disconnected';
  try {
    await redisClient.ping();
    redisStatus = 'connected';
  } catch (error) {
    redisStatus = 'error';
  }

  res.status(200).json({
    status: 'OK',
    redis: redisStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

export default app;