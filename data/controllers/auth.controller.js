import {
  registerRequestSchema,
  loginRequestSchema,
  usersListReqSchema,
  updateUserInfoReqSchema,
} from "../helpers/joi_validations/auth.joi.js";
import { logActivity } from "../helpers/loggers/activity/activity.log.js";
import { encrypt } from "../helpers/utils/encrypt.js";
import { updateActivityLogResponse } from "../helpers/loggers/activity/activity.log.js";
import {
  getUsersHandler,
  loginHandler,
  registerUserHandler,
  updateUserInfoHandler,
} from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    // raw request logging
    const activitylog = await logActivity(
      req,
      "REGISTER_USER",
      encrypt(JSON.stringify(req.body))
    );
    // schematic validation
    const payload = await registerRequestSchema.validateAsync(req.body);
    // Data fields extraction
    const { userName, email, password, role } = payload;
    // Logic
    const result = await registerUserHandler(userName, email, password, role);
    // Construct final response
    const finalResponse = {
      error: false,
      data: { userId: result._id, message: "User created successfully" },
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse, 200);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while registering user :: register()");
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(
      req,
      "LOGIN",
      encrypt(JSON.stringify(req.body))
    );

    // Schematic validation
    const payload = await loginRequestSchema.validateAsync(req.body);

    // Data fields extraction
    const { userId, password } = payload;

    // Logic
    const token = await loginHandler(userId, password);

    // Construct final response
    const finalResponse = {
      error: false,
      data: { token: token },
    };

    const finalResponseEncrypted = {
      error: false,
      data: encrypt(JSON.stringify({ token: token })),
    };

    const expiryTime = 24 * 60 * 60 * 1000; // 24 h
    res.cookie("token", `Bearer ${token}`, {
      httpOnly: true,
      expires: new Date(Date.now() + 1 * expiryTime),
    });

    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponseEncrypted);

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while login :: login()");
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // NOTE: Since HTTP Only cookies are used, this endpoint is required to clear them
    // Raw request logging
    const activitylog = await logActivity(req, "LOGOUT", null);

    // Construct final response
    const finalResponse = {
      error: false,
      data: { success: true },
    };

    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while logout :: logout()");
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "GET_USERS", req.body);
    // Schematic validation
    const payload = await usersListReqSchema.validateAsync(req.body);
    console.log(payload);
    // Logic
    const result = await getUsersHandler(
      payload.pagination,
      payload.filters,
      payload.sort
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
    console.error("Error while retrieving users list :: getUsers()");
    next(error);
  }
};

export const updateUserInfo = async (req, res, next) => {
  try {
    // Raw request logging
    const activitylog = await logActivity(req, "UPDATE_USER_INFO", req.body);
    // Schematic validation
    const payload = await updateUserInfoReqSchema.validateAsync(req.body);
    // Logic
    const result = await updateUserInfoHandler(payload);
    // Construct final response
    const finalResponse = {
      error: false,
      data: result,
    };
    // Update response in log
    await updateActivityLogResponse(activitylog._id, finalResponse);
    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error while updating userInfo :: updateUserInfo()");
    next(error);
  }
};
