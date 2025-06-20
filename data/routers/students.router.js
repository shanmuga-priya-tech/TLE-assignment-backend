import { Router } from "express";
const studentRouter = Router();
import {
  addStudents,
  contestsList,
  getStudentsList,
  ratingsGraph,
} from "../controllers/students.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

studentRouter.post("/list", verifyToken, getStudentsList);
studentRouter.post("/add", verifyToken, addStudents);
studentRouter.post("/ratingsGraph", verifyToken, ratingsGraph);
studentRouter.post("/contestsList", verifyToken, contestsList);

export default studentRouter;
