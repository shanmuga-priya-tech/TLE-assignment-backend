import { Schema, model } from "mongoose";

const cfUserInfoSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    lastOnlineTimeSeconds: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    friendOfCount: {
      type: Number,
      required: true,
    },
    titlePhoto: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    contribution: {
      type: Number,
      required: true,
    },
    organization: {
      type: String,
      default: "",
    },
    rank: {
      type: String,
      required: true,
    },
    maxRating: {
      type: Number,
      required: true,
    },
    registrationTimeSeconds: {
      type: Number,
      required: true,
    },
    maxRank: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const cfUserInfoModel = model("cfUserInfo", cfUserInfoSchema);
export default cfUserInfoModel;
