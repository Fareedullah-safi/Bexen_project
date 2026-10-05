import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env.local");
  }

  mongoose.connect(MONGODB_URI);

  console.log("MongoDB connected successfully");

  return mongoose.connection;
}
