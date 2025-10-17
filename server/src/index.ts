import {server} from './server'
import mongoose from 'mongoose'



const PORT = process.env.PORT || 8500

async function startServer() {

  try{
    server.listen(PORT, async () => {
      try{
        await mongoose.connect(process.env.MONGO_URI || '')
      }
      catch(err){
        console.error('Failed to connect to the database:', err);
      }
    })
    console.log(`Server is running on port ${PORT}`);
  }
  catch(err){
    console.error('Failed to start server:', err);
    process.exit(1);
  }

}

startServer();