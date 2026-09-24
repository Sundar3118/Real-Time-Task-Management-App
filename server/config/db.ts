import mongoose from 'mongoose';

export const dbStatus = {
  connected: false,
  usingFallback: false,
  message: 'Initializing...',
};

/**
 * Connect to MongoDB database via Mongoose.
 * If no MONGODB_URI is provided or connection fails (e.g. local mongod not running),
 * smoothly fall back to the built-in local store so the app is 100% operational.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    dbStatus.connected = false;
    dbStatus.usingFallback = true;
    dbStatus.message = 'Using local memory store (Set MONGODB_URI in .env for MongoDB)';
    console.log('ℹ️ No MONGODB_URI provided. Running with in-memory store for instant zero-config testing.');
    return;
  }

  try {
    console.log(`🔌 Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    dbStatus.connected = true;
    dbStatus.usingFallback = false;
    dbStatus.message = 'Connected to MongoDB';
    console.log('✅ Successfully connected to MongoDB database!');
  } catch (error: any) {
    dbStatus.connected = false;
    dbStatus.usingFallback = true;
    dbStatus.message = `MongoDB unreachable (${error.message || 'connection failed'}). Using fallback store.`;
    console.warn('⚠️ Could not connect to MongoDB:', error.message);
    console.warn('💡 Falling back to built-in store so you can test features without a local MongoDB server.');
  }
}
