import express from 'express'
import dotenv from 'dotenv'
import { Server as SocketIOServer } from 'socket.io';
import errorMiddleware from './app/middlewares/errorMiddleware';
import authRoutes from './app/routes/auth.routes';
import projectRoutes from './app/routes/project.routes';
import taskRoutes from './app/routes/task.routes';
import commentRoutes from './app/routes/comment.routes';
import teamRoutes from './app/routes/team.routes';
import invitationRoutes from './app/routes/invitation.routes';
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import mongoose from 'mongoose'

dotenv.config();

const app = express()

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ||  "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// MongoDB connection handler for serverless
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// middlewares 
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Connect to DB before handling requests (for Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});


// routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRoutes);

app.use(errorMiddleware);

process.on('SIGTERM', () => {
  server.close(() => { console.log('HTTP server closed'); process.exit(0); });
});

export { app, server, io };