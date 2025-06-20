import { Schema, model } from "mongoose";

const cfRatingInfoSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    ratingUpdateTimeSeconds: {
      type: Number,
      required: true,
    },
    oldRating: {
      type: Number,
      required: true,
    },
    newRating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const cfRatingInfoModel = model("cfRatingInfo", cfRatingInfoSchema);
export default cfRatingInfoModel;
