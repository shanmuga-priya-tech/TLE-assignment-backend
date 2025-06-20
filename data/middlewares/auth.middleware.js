import jwt from "jsonwebtoken";
import { Types } from "mongoose";
export const verifyToken = async (req, res, next) => {
  try {
    // const token = req.header("Authorization");
    const { token } = req.cookies;

    if (!token)
      return res.status(401).json({
        error: true,
        data: {
          errorMessage: "Access denied. Unauthorised request",
        },
      });

    const splitString = token.split(" ");
    if (splitString.length !== 2) {
      return res.status(401).json({
        error: true,
        data: { errorMessage: "Access denied. Invalid access key" },
      });
    }

    const decodedToken = jwt.verify(splitString[1], process.env.SECRET_KEY);

    req.userId = new Types.ObjectId(decodedToken.userId);
    req.userName = decodedToken.userName;
    req.role = decodedToken.role;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      data: { errorMessage: "Access denied. Invalid access key" },
    });
  }
};

export const verifyAdminAuthority = async (req, res, next) => {
  try {
    // const token = req.header("Authorization");
    const { token } = req.cookies;
    const splitString = token.split(" ");
    const decodedToken = jwt.verify(splitString[1], process.env.SECRET_KEY);
    if (decodedToken.role == "ADMIN") {
      next();
    } else {
      return res.status(403).json({
        error: true,
        data: { errorMessage: "Access denied. Forbidden request" },
      });
    }
  } catch (error) {
    return res.status(403).json({
      error: true,
      data: { errorMessage: "Access denied. Forbidden request" },
    });
  }
};
