import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function ensureAdminExists() {
  console.log("🚀 Verificando admin...");

  const adminEmail = "sokacheskicorp@gmail.com";

  const adminExists = await User.findOne({ email: adminEmail });

  if (adminExists) {
    console.log("🍁 Admin sokacheski ta on");
    return;
  }

  console.log("⚠️ Admin não encontrado, criando...");

  const hashedPassword = bcrypt.hashSync("Sk181007$", 10);

  await User.create({
    name: "Sokacheski",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Administrador criado com sucesso");
}
