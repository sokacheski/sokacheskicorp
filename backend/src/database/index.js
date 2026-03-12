import mongoose from "mongoose";

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 MongoDB conectado em", mongoose.connection.name);
  } catch (error) {
    console.error("🔴 Erro ao conectar no MongoDB", error);
    process.exit(1);
  }
}
