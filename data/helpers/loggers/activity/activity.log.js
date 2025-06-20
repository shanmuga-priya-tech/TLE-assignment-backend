import activityLogModel from "../../../models/activity.log.model.js";
export const logActivity = async (req, activityLabel, payload) => {
  try {
    const createLog = await activityLogModel.create({
      activity: activityLabel,
      payload: payload,
      userId: req.userId || null,
      userName: req.userName || null,
      url: req.originalUrl,
      headers: req.headers,
      ip: req.ip, //TODO: reverse_proxy'd IP should not be used instead the origin
    });
    req.logInfo = {
      logId: createLog._id,
      errorResponseUpdateFn: "updateActivityLogResponse",
    };
    return createLog;
  } catch (error) {
    console.error("Error while logging activity :: logActivity()");
    throw error;
  }
};

export const updateActivityLogResponse = async (logId, response, status) => {
  try {
    if (response) {
      await activityLogModel.updateOne(
        { _id: logId },
        { $set: { response: response, statusCode: status } }
      );
    }
  } catch (error) {
    console.error(
      "Error while updating activity log response :: updateActivityLogResponse()"
    );
    throw error;
  }
};
