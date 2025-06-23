import { Schema, model } from "mongoose";

const exportSchema = new Schema(
  {
    status: {
      type: String,
      default: "processing",
    },
    filePath: { type: String, default: "" },
  },
  { timestamps: true }
);

const exportModel = model("export", exportSchema);
export default exportModel;
