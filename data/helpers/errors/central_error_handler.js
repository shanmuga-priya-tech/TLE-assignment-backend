import { updateActivityLogResponse } from "../loggers/activity/activity.log.js";

const errorResponseLogger = async (req, errorResponse) => {
  try {
    await updateActivityLogResponse(
      req.logInfo.logId,
      errorResponse,
      errorResponse?.data?.statusCode || 500
    );
  } catch (error) {
    console.error(
      `Error while updating error response log for logInfo ${req.logInfo}`
    );
    console.error(error);
  }
};

const maskUrls = ["/auth/login"];

const maskErrorResponse = (req, errorResponse) => {
  try {
    if (maskUrls.some((maskUrl) => req?.url.includes(maskUrl))) {
      const maskedErrorResponse = errorResponse;
      delete maskedErrorResponse.data.statusCode;
      delete maskedErrorResponse.data.statusText;
      delete maskedErrorResponse.data.errorCode;
      delete maskedErrorResponse.data.errorData;
      return maskedErrorResponse;
    }
  } catch (error) {
    console.error(`Error while masking error response :: maskErrorResponse()`);
    console.error(error);
  }
  return errorResponse;
};

export const errorBuilder = (error) => {
  try {
    let statusCode =
      error?.statusCode || error?.response?.status || error?.status || 500;
    const statusText = error?.response?.statusText || error?.statusText || "";
    const errorCode = error?.code;
    const errorData = error?.response?.data || error?.data || {};
    const errorMessage = error?.message ? error.message : error;

    if (error?.isJoi || error?.name === "ValidationError") {
      statusCode = 400;
    }

    const responseData = {
      error: true,
      data: {
        statusCode: statusCode,
        statusText: statusText,
        errorCode: errorCode,
        errorData: errorData,
        errorMessage: errorMessage,
      },
    };

    return responseData;
  } catch (error) {
    console.error("error while constructing error response :: errorBuilder()");
    console.error(error);
    //TODO: Mandatory threshold based alerts
    return {
      error: true,
      data: {
        statusCode: error?.statusCode || 500,
        errorMessage:
          error?.statusCode !== 500
            ? "Contact admin for error info"
            : "Internal server error",
      },
    };
  }
};

export const errorHandler = async (error, req, res, next) => {
  // console.log(error);
  const errorResponse = errorBuilder(error);

  // central error response log updation
  await errorResponseLogger(req, errorResponse);

  const statusCode = errorResponse.data.statusCode;
  const parsedError = maskErrorResponse(req, errorResponse);

  return res.status(statusCode).json(parsedError);
};
