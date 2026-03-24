import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminOnly, memberOnly } from "../middlewares/roleMiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = Router();

/* =========================
   🔐 TESTES DE ACESSO
========================= */
router.get("/admin", authMiddleware, adminOnly, (req, res) => {
  res.json({ message: "Painel administrativo autorizado" });
});

router.get("/member", authMiddleware, memberOnly, (req, res) => {
  res.json({ message: "Área do membro autorizada" });
});

/* =========================
   👤 PERFIL DO USUÁRIO LOGADO
========================= */

// 📋 Buscar dados do usuário logado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -resetPasswordCode -resetPasswordExpires");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

// ✏️ Atualizar perfil do usuário logado
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});

/* =========================
   👥 USUÁRIOS (ADMIN)
========================= */

// 📋 Listar usuários
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ role: 1, createdAt: 1 })
      .select("-password -resetPasswordCode -resetPasswordExpires");

    return res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      message: "Erro ao buscar usuários",
    });
  }
});

// ➕ Criar usuário manualmente (admin)
router.post("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "member",
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return res.status(500).json({
      message: "Erro ao criar usuário",
    });
  }
});

// 🗑️ Remover usuário
router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin users cannot be deleted",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      message: "Erro ao excluir usuário",
    });
  }
});

export default router;