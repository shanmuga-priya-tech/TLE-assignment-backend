import axios from "axios";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import exportModel from "../models/export.model.js";
import studentModel from "../models/student.model.js";

const getStudentList = async () => {
  try {
    const studentsList = await studentModel.aggregate([
      {
        $lookup: {
          from: "cfuserinfos",
          localField: "_id",
          foreignField: "studentId",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          currentRating: { $ifNull: ["$result.rating", null] },
          maxRating: { $ifNull: ["$result.maxRating", null] },
        },
      },
      {
        $unset: "result",
      },
    ]);

    return studentsList;
  } catch (error) {
    console.error("Error while  getting student list");
    console.log(error.message);
    throw error;
  }
};

//fn to generate CSV
const generateCSV = (data, filePath) => {
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data);
  fs.writeFileSync(filePath, csv);
};

//create consumer
const fetchExportData = async (job) => {
  try {
    const { _id } = job.data;
    console.log(`Processing export job for ID: ${_id}`);

    //1)fetch students list
    const studentsListResponse = await getStudentList();

    if (studentsListResponse?.length > 0) {
      const studentsList = studentsListResponse;

      //2)generating CSV

      const exportDir = path.resolve(process.cwd(), "exports");

      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

      const filePath = path.join(exportDir, `students_${_id}.csv`);

      generateCSV(studentsList, filePath);

      //3) updating doc with status and path
      await exportModel.findOneAndUpdate(
        { _id },
        { status: "generated", filePath }
      );

      console.log(`Export job completed. CSV saved to: ${filePath}`);
    } else {
      // No data case
      await exportModel.findOneAndUpdate(
        { _id },
        { status: "failed", filePath: "" }
      );
      console.error("No student data found or response invalid.");
    }
  } catch (error) {
    console.error(
      "Error while fetching students list in consumer :: fetchExportData()"
    );
    console.log(error.message);
    console.error(errorBuilder(error));
  }
};

export default fetchExportData;
