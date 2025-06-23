import Joi from "joi";
import { studentsSortFieldEnums } from "../enums/enums.config.js";
import { Types } from "mongoose";

const paginationSchema = Joi.object({
  pageNo: Joi.number().min(1).required(),
  limitPerPage: Joi.number().min(1).max(10).required(),
});

const studentFiltersSchema = Joi.object({
  searchText: Joi.string().allow(null).required(),
});

const studentSortSchema = Joi.object({
  sortField: Joi.string()
    .valid(...studentsSortFieldEnums)
    .default("studentName")
    .required(),
  sortDirection: Joi.number().valid(1, -1).default(1).required(),
});

export const studentsListReqSchema = Joi.object({
  pagination: paginationSchema.required(),
  filters: studentFiltersSchema.required(),
  sort: studentSortSchema.required(),
}).required();

export const addStudentsReqSchema = Joi.array()
  .items(
    Joi.object({
      studentName: Joi.string().lowercase().max(20).required(),
      studentEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      studentPhone: Joi.string().min(10).max(13).required(), // +91 allowed
      studentCFHandle: Joi.string().required(),
    }).required()
  )
  .required();

const objectIdSchema = Joi.custom((value, helpers) => {
  // allow if the value is either direct objectId or a string which is a valid objectId if type-casted
  if (Types.ObjectId.isValid(value.$oid ? value.$oid : value)) {
    return new Types.ObjectId(value.$oid ? value.$oid : value);
  }
  return helpers.error("any.invalid");
});

export const getStudentInfoReqSchema = Joi.object({
  studentId: objectIdSchema.required(),
}).required();

export const ratingsGraphReqSchema = Joi.object({
  studentId: objectIdSchema.required(),
  dateRange: Joi.number().max(3650).required(),
}).required();

export const contestsListReqSchema = Joi.object({
  studentId: objectIdSchema.required(),
  dateRange: Joi.number().max(3650).required(),
  pagination: paginationSchema.required(),
}).required();

export const submissionStatsReqSchema = Joi.object({
  studentId: objectIdSchema.required(),
  dateRange: Joi.number().max(3650).required(),
}).required();
