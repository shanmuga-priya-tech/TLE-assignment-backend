import Joi from "joi";
import { userRoles, usersSortFieldEnums } from "../enums/enums.config.js";
import { Types } from "mongoose";

export const registerRequestSchema = Joi.object({
  userName: Joi.string().lowercase().max(20).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(10).required(),
  role: Joi.string()
    .valid(...userRoles)
    .required(),
}).required();

export const loginRequestSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.base": "userId must be a valid string.",
    "string.empty": "userId cannot be empty.",
    "any.required": "Invalid request payload. Mandatory fields are missing.", //If field name is n't present, mask the field name in error message
  }),
  password: Joi.string().required().messages({
    "string.base": "password must be a valid string.",
    "string.empty": "password cannot be empty.",
    "any.required": "Invalid request payload. Mandatory fields are missing.", //If field name is n't present, mask the field name in error message
  }),
}).required();

const paginationSchema = Joi.object({
  pageNo: Joi.number().min(1).required(),
  limitPerPage: Joi.number().min(1).max(10).required(),
});

const userFiltersSchema = Joi.object({
  searchText: Joi.string().allow(null).required(),
});

const userSortSchema = Joi.object({
  sortField: Joi.string()
    .valid(...usersSortFieldEnums)
    .default("role")
    .required(),
  sortDirection: Joi.number().valid(1, -1).default(1).required(),
});

export const usersListReqSchema = Joi.object({
  pagination: paginationSchema.required(),
  filters: userFiltersSchema.required(),
  sort: userSortSchema.required(),
}).required();

const objectIdSchema = Joi.custom((value, helpers) => {
  // allow if the value is either direct objectId or a string which is a valid objectId if type-casted
  if (Types.ObjectId.isValid(value.$oid ? value.$oid : value)) {
    return new Types.ObjectId(value.$oid ? value.$oid : value);
  }
  return helpers.error("any.invalid");
});

export const updateUserInfoReqSchema = Joi.object({
  userId: objectIdSchema.required(),
  userName: Joi.string().allow(null).required(),
  password: Joi.string().min(10).allow(null).required(),
})
  .custom((value, helpers) => {
    const { userName, password } = value;

    // Check if all three are empty
    if (!userName && !password) {
      throw new CustomError(
        "At least one of 'userName', 'password' must have a value.",
        400
      );
    }

    return value; // Validation passed
  })
  .required();
