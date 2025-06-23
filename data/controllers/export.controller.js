import {
  logActivity,
  updateActivityLogResponse,
} from "../helpers/loggers/activity/activity.log.js";
import {
  fetchExportDataHandler,
  generateCSVFileHandler,
} from "../services/export.service.js";

export const generateCSVFile = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "EXPORT_CSV");
    // Logic
    const result = await generateCSVFileHandler();
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error(
      "Error while initiating CSV file generation :: generateCSVFile()"
    );
    next(error);
  }
};

export const fetchExportData = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "FETCH_EXPORT_DATA");
    // Logic
    const result = await fetchExportDataHandler();
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while fetching Export Data :: fetchExportData()");
    next(error);
  }
};
