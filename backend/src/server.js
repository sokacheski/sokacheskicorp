import dotenv from "dotenv";
dotenv.config();

console.log("MONGO_URI =", process.env.MONGO_URI);

import app from "./app.js";
import { connectDatabase } from "./database/index.js";
import { ensureAdminExists } from "./utils/ensureAdmin.js";

async function bootstrap() {
  await connectDatabase();
  await ensureAdminExists();

  app.listen(process.env.PORT, () => {
    console.log(`🔥 Backend rodando em http://localhost:${process.env.PORT}`);
  });
}

bootstrap();