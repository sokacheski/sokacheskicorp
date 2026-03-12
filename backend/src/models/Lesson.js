import mongoose from "mongoose";

// Schema para arquivos complementares
const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
}, { _id: false });

const lessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Modulo", // 👈 Mantenha como "Modulo" que é o nome do seu modelo
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    mediaType: {
      type: String,
      enum: ["external", "video", "audio", "pdf"],
      default: "external",
    },

    media: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    published: {
      type: Boolean,
      default: false,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    // 👈 NOVO: Dias de espera para liberação
    waitDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 👈 NOVO: Arquivos complementares
    files: {
      type: [FileSchema],
      default: [],
    },

    duration: {
      type: String,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual para URL da imagem
lessonSchema.virtual("imageUrl").get(function() {
  return this.image || null;
});

// Índice composto para otimizar buscas por módulo e ordem
lessonSchema.index({ module: 1, order: 1 });

// 🔥 Verifica se o modelo já existe antes de criar
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

export default Lesson;