import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    studentPhone: {
      type: String,
      required: true,
    },
    studentCFHandle: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const studentModel = model("student", studentSchema);
export default studentModel;
