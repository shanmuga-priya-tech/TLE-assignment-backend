import { Router } from "express";
import {
  addStudents,
  contestsList,
  getStudentsList,
  getStudentInfo,
  updateStudent,
  ratingsGraph,
  getStudentStats,
  getSubmissionBarChart,
  getSubmissionHeatMap,
} from "../controllers/students.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  fetchExportData,
  generateCSVFile,
} from "../controllers/export.controller.js";

const studentRouter = Router();

studentRouter.post("/list", verifyToken, getStudentsList);
studentRouter.post("/add", verifyToken, addStudents);
studentRouter.post("/info", verifyToken, getStudentInfo);
studentRouter.patch("/info", verifyToken, updateStudent);
studentRouter.post("/ratingsGraph", verifyToken, ratingsGraph);
studentRouter.post("/contestsList", verifyToken, contestsList);
studentRouter.post("/stats", verifyToken, getStudentStats);
studentRouter.post("/barchart", verifyToken, getSubmissionBarChart);
studentRouter.post("/heatMap", verifyToken, getSubmissionHeatMap);

//export
studentRouter.post("/export", verifyToken, generateCSVFile);
studentRouter.get("/export", verifyToken, fetchExportData);

export default studentRouter;
