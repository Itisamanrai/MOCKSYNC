const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  // Conservative pool/timeouts for a small long-running Node API.
  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  });

  isConnected = true;
  console.log("[db] MongoDB connected");
};

module.exports = { connectDB };
