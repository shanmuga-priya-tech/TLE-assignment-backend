import CustomError from "../helpers/errors/custom_error.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUserHandler = async (userName, email, password, role) => {
  try {
    // Duplicate email validation
    const duplicateEmail = await userModel.findOne(
      { email: email, isDeleted: false },
      null,
      {
        collation: { locale: "en", strength: 1 },
      }
    );
    if (duplicateEmail) {
      throw new CustomError(
        "Duplicate register request. Email should be unique",
        409
      );
    }

    // Duplicate userName validation
    const duplicateUserName = await userModel.findOne(
      { userName: userName, isDeleted: false },
      null,
      {
        collation: { locale: "en", strength: 1 },
      }
    );
    if (duplicateUserName) {
      throw new CustomError(
        "Duplicate register request. Username should be unique",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Register new user in DB
    const user = await userModel.create({
      userName: userName,
      email: email,
      password: hashedPassword,
      role: role,
    });

    return user;
  } catch (error) {
    console.error(
      "Error while handling register user request :: registerUserHandler()"
    );
    throw error;
  }
};

export const loginHandler = async (userId, password) => {
  try {
    // User retrieval
    let user = await userModel.findOne({ userName: userId }, null, {
      collation: { locale: "en", strength: 1 },
    });
    if (!user) {
      user = await userModel.findOne({ email: userId });
      if (!user) {
        return res.status(401).json({
          error: true,
          data: {
            errorMessage: "Authentication failed. Invalid credentials",
          },
        });
      }
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        data: {
          errorMessage: "Authentication failed. Invalid credentials",
        },
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.userName,
        userEmail: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    await userModel.updateOne({ lastLogin: new Date() });

    return token;
  } catch (error) {
    console.error("Error while handling login request :: loginHandler()");
    throw error;
  }
};

export const getUsersHandler = async (pagination, filters, sort) => {
  try {
    const aggregationStages = [];

    if (filters.searchText) {
      aggregationStages.push({
        $match: {
          $or: [
            { userName: { $regex: filters.searchText, $options: "i" } },
            { email: { $regex: filters.searchText, $options: "i" } },
          ],
        },
      });
    }

    aggregationStages.push({
      $sort: {
        [sort.sortField]: sort.sortDirection,
      },
    });

    aggregationStages.push({
      $skip: (pagination.pageNo - 1) * pagination.limitPerPage,
    });

    aggregationStages.push({ $limit: pagination.limitPerPage });

    aggregationStages.push({ $project: { password: 0, isDeleted: 0 } });

    const countAggregationStages = [...aggregationStages];
    countAggregationStages.splice(-4); //Remove sort, skip and limit

    countAggregationStages.push({
      $count: "count",
    });

    const [usersResult, countResult] = await Promise.all([
      userModel.aggregate(aggregationStages),
      userModel.aggregate(countAggregationStages),
    ]);

    let totalCount = countResult.length === 1 ? countResult[0]?.count || 0 : 0;

    return {
      users: usersResult,
      totalCount: totalCount,
      // aggregationQueries: {
      //   data: aggregationStages,
      //   count: countAggregationStages,
      // },
    };
  } catch (error) {
    console.error(
      "Error while handling get users list request :: getUsershandler()"
    );
    throw error;
  }
};

export const updateUserInfoHandler = async (payload) => {
  try {
    const user = await userModel.findOne({ _id: payload.userId });
    if (!user) {
      throw new CustomError(
        "Invalid update request. No user found for the given userId",
        400
      );
    }

    const updateObj = {};
    const fieldsToBeUpdated = [];

    if (payload.userName) {
      // Duplicate userName validation
      const duplicateUserName = await userModel.findOne(
        { userName: payload.userName, isDeleted: false },
        null,
        {
          collation: { locale: "en", strength: 1 },
        }
      );
      if (duplicateUserName) {
        throw new CustomError(
          "Invalid update request. Username should be unique",
          409
        );
      } else {
        updateObj["userName"] = payload.userName;
        fieldsToBeUpdated.push("userName");
      }
    }

    if (payload.password) {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      updateObj["password"] = hashedPassword;
      fieldsToBeUpdated.push("password");
    }

    if (Object.keys(updateObj).length == 0) {
      throw new CustomError(
        "At least one of 'userName', 'password' must have a value.",
        400
      );
    }

    await userModel.updateOne({ _id: payload.userId }, { $set: updateObj });

    return {
      message: `Fields: [${fieldsToBeUpdated}] updated successfully`,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
