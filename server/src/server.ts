import express from 'express'
import dotenv from 'dotenv'
import { Server as SocketIOServer } from 'socket.io';
import errorMiddleware from './app/middlewares/errorMiddleware';
import authRoutes from './app/routes/auth.routes';
import projectRoutes from './app/routes/project.routes';
import taskRoutes from './app/routes/task.routes';
import commentRoutes from './app/routes/comment.routes';
import teamRoutes from './app/routes/team.routes';
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'

const app = express()

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ||  "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// middlewares 
dotenv.config()
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/get', ()=> {
  console.log("Get request received");
})
// routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/teams', teamRoutes);

app.use(errorMiddleware);

process.on('SIGTERM', () => {
  server.close(() => { console.log('HTTP server closed'); process.exit(0); });
});

export { app, server, io };