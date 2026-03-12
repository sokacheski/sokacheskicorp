import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    layout: {
      type: String,
      enum: ["horizontal", "vertical"],
      required: true,
    },

    published: {
      type: Boolean,
      default: true,
    },

    // preparado para ordenação futura
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Section", SectionSchema);