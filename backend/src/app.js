import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import sectionRoutes from "./routes/section.routes.js"; 
import courseRoutes from "./routes/course.routes.js";
import modulosRoutes from "./routes/modulos.routes.js";
import lessonRoutes from "./routes/lesson.routes.js"; // ✅ AGORA FUNCIONA

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

// vitrine / cursos
app.use(sectionRoutes);
app.use("/courses", courseRoutes);

// módulos
app.use(modulosRoutes);
app.use("/api", modulosRoutes);

// aulas
app.use(lessonRoutes);
app.use("/api", lessonRoutes);

app.get("/", (req, res) => {
  res.json({ status: "API running 🚀" });
});

export default app;