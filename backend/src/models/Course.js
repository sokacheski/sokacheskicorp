import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    salesUrl: {
      type: String,
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    releaseDays: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      default: 0, // 👈 CAMPO JÁ EXISTE
    },

    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", CourseSchema);