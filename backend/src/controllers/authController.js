import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../services/mailService.js";

const ADMIN_EMAIL = "sokacheskicorp@gmail.com";
const TOKEN_EXPIRES_IN = "1d";

function ensureJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

export async function register(req, res) {
  try {
    ensureJwtSecret();

    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Dados obrigatórios ausentes",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "Usuário já existe",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const adminExists = await User.findOne({ role: "admin" });

    let userRole = "member";

    if (!adminExists && email === ADMIN_EMAIL) {
      userRole = "admin";
    }

    if (role === "bot") {
      userRole = "bot";
    }

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: error.message.includes("JWT_SECRET")
        ? error.message
        : "Erro ao registrar usuário",
    });
  }
}

export async function login(req, res) {
  try {
    ensureJwtSecret();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: "Senha inválida",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message.includes("JWT_SECRET")
        ? error.message
        : "Erro ao efetuar login",
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email é obrigatório",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();
    await sendResetPasswordEmail(email, code);

    return res.json({
      message: "Código de recuperação enviado para o email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Erro ao enviar código",
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        message: "Dados obrigatórios ausentes",
      });
    }

    const hashedCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordCode: hashedCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Código inválido ou expirado",
      });
    }

    user.password = bcrypt.hashSync(password, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Erro ao redefinir senha",
    });
  }
}
