import { model, Schema } from "mongoose";
import { activityLabelEnums } from "../helpers/enums/enums.config.js";

const activityLogSchema = new Schema(
  {
    activity: {
      type: String,
      required: true,
      enum: activityLabelEnums,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    userId: {
      type: Schema.Types.ObjectId,
      // required: true,
    },
    userName: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      required: true,
    },
    headers: {
      type: Object,
    },
    ip: {
      type: String,
      required: true,
    },
    response: {
      type: Object,
      default: null,
    },
    statusCode: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const activityLogModel = model("activitylog", activityLogSchema);

export default activityLogModel;
