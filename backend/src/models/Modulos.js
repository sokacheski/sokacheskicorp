import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| MÓDULO (item dentro da seção)
|--------------------------------------------------------------------------
*/

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    published: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0, // 👈 JÁ EXISTE
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| SEÇÃO DO CURSO
|--------------------------------------------------------------------------
*/

const ModuloSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    layout: {
      type: String,
      enum: ["vertical", "horizontal"],
      default: "vertical",
    },

    published: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0, // 👈 JÁ EXISTE
    },

    items: {
      type: [ItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Modulo", ModuloSchema);