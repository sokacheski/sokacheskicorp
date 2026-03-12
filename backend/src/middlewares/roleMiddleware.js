export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acesso restrito ao administrador",
    });
  }
  return next();
}

export function memberOnly(req, res, next) {
  if (!req.user || req.user.role !== "member") {
    return res.status(403).json({
      message: "Acesso restrito a membros",
    });
  }
  return next();
}
