import mongoose from 'mongoose';

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI || 'mongodb+srv://musariaz520_db_user:nRNXbu9InA4CVBug@cluster0.6shunxs.mongodb.net/';
  console.log('Connecting to MongoDB at', uri);
  return mongoose.connect(uri, {
    // useNewUrlParser, useUnifiedTopology options are defaults on modern mongoose
  } as any);
}

export default connectDB;
