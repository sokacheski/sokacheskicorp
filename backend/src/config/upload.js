import multer from "multer";
import path from "path";
import crypto from "crypto";

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/courses");
    },
    filename: (req, file, cb) => {
      const hash = crypto.randomBytes(8).toString("hex");
      const ext = path.extname(file.originalname);
      cb(null, `${hash}${ext}`);
    },
  }),
});