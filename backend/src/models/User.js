import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member", "bot"],
      default: "member",
    },

    lastLogin: {
  type: Date,
    },

    // 🔐 RECUPERAÇÃO DE SENHA
    resetPasswordCode: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
