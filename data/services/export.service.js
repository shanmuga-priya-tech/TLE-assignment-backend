import exportModel from "../models/export.model.js";
import exportQueue from "../queues/CSV_export.queue.js";

export const generateCSVFileHandler = async () => {
  try {
    // push to DB
    const newDoc = await exportModel.create({
      status: "processing",
      filePath: "",
    });
    // push to queue
    await exportQueue.add({
      _id: newDoc._id,
    });

    return newDoc;
  } catch (error) {
    console.error(
      "Error while Initiating CSV File generation :: generateCSVFileHandler() "
    );
    throw error;
  }
};

export const fetchExportDataHandler = async () => {
  try {
    // fetch from  DB
    const exportData = await exportModel.find({});

    return exportData;
  } catch (error) {
    console.error(
      "Error while Fetching Export Data :: fetchExportDataHandler() "
    );
    throw error;
  }
};
