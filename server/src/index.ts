import {server, app} from './server'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 8500

async function startServer() {
  try{
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || '')
    console.log('Connected to MongoDB');
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  }
  catch(err){
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export the Express app for Vercel serverless
export default app;