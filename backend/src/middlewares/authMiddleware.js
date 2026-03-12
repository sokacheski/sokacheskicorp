import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // 🔐 Header inexistente ou inválido
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token não fornecido ou malformado",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET não definido no .env");
    return res.status(500).json({
      message: "Erro interno de autenticação",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔗 payload padrão do token
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado",
    });
  }
}
