import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Server as SocketIOServer } from 'socket.io';
import errorMiddleware from './app/middlewares/errorMiddleware';
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
app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))



app.use(errorMiddleware);

process.on('SIGTERM', () => {
  server.close(() => { console.log('HTTP server closed'); process.exit(0); });
});

export { app, server, io };