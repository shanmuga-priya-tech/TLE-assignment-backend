import {
  addStudentsReqSchema,
  contestsListReqSchema,
  ratingsGraphReqSchema,
  studentsListReqSchema,
  submissionStatsReqSchema,
} from "../helpers/joi_validations/students.joi.js";
import {
  logActivity,
  updateActivityLogResponse,
} from "../helpers/loggers/activity/activity.log.js";
import {
  addStudentsHandler,
  contestsListHandler,
  getStudentListHandler,
  ratingsGraphHandler,
  submissionBarChartHandler,
  submissionHeatMapHandler,
  submissionStatsHandler,
} from "../services/students.service.js";

export const getStudentsList = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "FETCH_STUDENTS_LIST", req.body);
    // Schematic validation
    const payload = await studentsListReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { pagination, filters, sort } = payload;
    // Logic
    const result = await getStudentListHandler(pagination, filters, sort);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while fetching students list :: studentsList()");
    next(error);
  }
};

export const addStudents = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "ADD_STUDENTS", req.body);
    // Schematic validation
    const payload = await addStudentsReqSchema.validateAsync(req.body);
    // Logic
    const result = await addStudentsHandler(payload);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while adding students :: addStudents()");
    next(error);
  }
};

export const getStudentInfo = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "GET_STUDENT", req.body);
    // Schematic validation
    const payload = await getStudentInfoReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId } = payload;
    // Logic
    const result = await getStudentInfoHandler(studentId);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while getting student info :: getStudentInfo()");
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "UPDATE_STUDENT_INFO", req.body);
    // Schematic validation
    const payload = await updateStudentReqSchema.validateAsync(req.body);
    // Data fields extraction
    const {
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      studentCFHandle,
    } = payload;
    // Logic
    const result = await updateStudentInfoHandler(
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      studentCFHandle
    );
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while updating students :: updateStudent()");
    next(error);
  }
};

export const ratingsGraph = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(
      req,
      "GET_RATINGS_GRAPH_DATA",
      req.body
    );
    // Schematic validation
    const payload = await ratingsGraphReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId, dateRange } = payload;
    // Logic
    const result = await ratingsGraphHandler(studentId, dateRange);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while fetching ratings graph :: ratingsGraph()");
    next(error);
  }
};

export const contestsList = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(
      req,
      "GET_CONTESTS_LIST_DATA",
      req.body
    );
    // Schematic validation
    const payload = await contestsListReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId, dateRange, pagination } = payload;
    // Logic
    const result = await contestsListHandler(studentId, dateRange, pagination);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while fetching ratings graph :: ratingsGraph()");
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "GET_SUBMISSION_DATA", req.body);
    // Schematic validation
    const payload = await submissionStatsReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId, dateRange } = payload;
    // Logic
    const result = await submissionStatsHandler(studentId, dateRange);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while getting stats :: studentStats()");
    next(error);
  }
};

export const getSubmissionBarChart = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(
      req,
      "GET_SUBMISSION_BARCHART",
      req.body
    );
    // Schematic validation
    const payload = await submissionStatsReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId, dateRange } = payload;
    // Logic
    const result = await submissionBarChartHandler(studentId, dateRange);
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
      "Error while fetching submission BarChart :: getSubmissionBarChart()"
    );
    next(error);
  }
};

export const getSubmissionHeatMap = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(
      req,
      "GET_SUBMISSION_HEATMAP",
      req.body
    );
    // Schematic validation
    const payload = await submissionStatsReqSchema.validateAsync(req.body);
    // Data fields extraction
    const { studentId, dateRange } = payload;
    // Logic
    const result = await submissionHeatMapHandler(studentId, dateRange);
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
      "Error while fetching submission HeatMap :: getSubmissionHeatMap()"
    );
    next(error);
  }
};
