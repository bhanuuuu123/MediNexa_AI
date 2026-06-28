import mongoose from "mongoose";

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected");
}

export default connectDB;
