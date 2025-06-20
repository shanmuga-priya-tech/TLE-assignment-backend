import {
  addStudentsReqSchema,
  contestsListReqSchema,
  ratingsGraphReqSchema,
  studentsListReqSchema,
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
