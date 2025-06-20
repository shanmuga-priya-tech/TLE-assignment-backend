import axios from "axios";
import cfUserInfoModel from "../models/cf_user_info.model.js";
import { Types } from "mongoose";
import cfRatingInfoModel from "../models/cf_rating_info.model.js";
import cfSubmissionInfoModel from "../models/cf_submission_info.model.js";
import { sleep } from "../helpers/utils/sleep.js";
import CustomError from "../helpers/errors/custom_error.js";
import { errorBuilder } from "../helpers/errors/central_error_handler.js";

const fetchCFUserInfo = async (cfHandle) => {
  try {
    const requestConfig = {
      method: "GET",
      maxBodyLength: Infinity,
      url: `https://codeforces.com/api/user.info?handles=${cfHandle}&checkHistoricHandles=false`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10 * 1000,
    };

    const cfResponse = await axios.request(requestConfig);

    return cfResponse.data;
  } catch (error) {
    console.error("Error while fetching CF user info :: fetchCFUserInfo()");
    console.log(
      `https://codeforces.com/api/user.info?handles=${cfHandle}&checkHistoricHandles=false`
    );
    console.error(errorBuilder(error));
  }
};

const fetchCFRatingInfo = async (cfHandle) => {
  try {
    const requestConfig = {
      method: "GET",
      maxBodyLength: Infinity,
      url: `https://codeforces.com/api/user.rating?handle=${cfHandle}`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10 * 1000,
    };

    const cfResponse = await axios.request(requestConfig);

    return cfResponse.data;
  } catch (error) {
    console.error("Error while fetching CF rating info :: fetchCFRatingInfo()");
    console.log(`https://codeforces.com/api/user.rating?handle=${cfHandle}`);
    console.error(errorBuilder(error));
  }
};

const fetchCFSubmissionInfo = async (cfHandle, retryCount = 0) => {
  try {
    if (retryCount >= 3) {
      return new CustomError(
        "fetchCFSubmissionInfo failed continously for 3 times",
        500
      );
    }
    const requestConfig = {
      method: "GET",
      maxBodyLength: Infinity,
      url: `https://codeforces.com/api/user.status?handle=${cfHandle}&from=1&count=10000`,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10 * 1000,
    };

    const cfResponse = await axios.request(requestConfig);

    return cfResponse.data;
  } catch (error) {
    console.error(
      "Error while fetching CF submission info :: fetchCFSubmissionInfo()"
    );
    console.log(
      `https://codeforces.com/api/user.status?handle=${cfHandle}&from=1&count=10000`
    );
    console.error(errorBuilder(error));
    await sleep(2000);
    return await fetchCFSubmissionInfo(cfHandle, retryCount + 1);
  }
};

const fetchCFData = async (job) => {
  try {
    const { _id, cfHandle } = job.data;
    console.log(`fetching CF data for _id: ${_id}, cfHandle: ${cfHandle}`);

    // TODO: Add External API error logs in a separate collection

    // API references
    // userInfo: https://codeforces.com/api/user.info?handles=DmitriyH&checkHistoricHandles=false
    // ratingInfo: https://codeforces.com/api/user.rating?handle=Fefer_Ivan
    // submissionInfo: https://codeforces.com/api/user.status?handle=Fefer_Ivan&from=1&count=10

    // TODO: Use promise all and resolve all promises simulteneously
    // TODO: Group multiple handle requests into a single request

    const [cfUserInfo, cfRatingInfo, cfSubmissionInfo] = await Promise.all([
      await fetchCFUserInfo(cfHandle),
      await fetchCFRatingInfo(cfHandle),
      await fetchCFSubmissionInfo(cfHandle),
    ]);

    // TODO: convert validations to JOI based
    // Validate and cache in DB
    // cfUserInfo
    if (cfUserInfo?.result?.length > 0 && cfUserInfo?.status == "OK") {
      await cfUserInfoModel.create({
        studentId: new Types.ObjectId(_id),
        ...cfUserInfo.result[0],
      });
    } else {
      // TODO: update error in students table
      // Sample error: {"status":"FAILED","comment":"handles: User with handle DmitriyH982 not found"}
    }

    // cfRatingInfo
    if (cfRatingInfo?.status == "OK") {
      if (cfRatingInfo?.result?.length > 0) {
        // add studentId to each record
        cfRatingInfo?.result?.forEach((info) => {
          info["studentId"] = new Types.ObjectId(_id);
        });
        await cfRatingInfoModel.insertMany(cfRatingInfo?.result);
      } else {
        // TODO: update error in students table
      }
    } else {
      // TODO: update error in some table ??
    }

    // cfSubmissionInfo
    if (cfSubmissionInfo?.status == "OK") {
      if (cfSubmissionInfo?.result?.length > 0) {
        // add studentId to each record
        cfSubmissionInfo?.result?.forEach((info) => {
          info["studentId"] = new Types.ObjectId(_id);
        });
        await cfSubmissionInfoModel.insertMany(cfSubmissionInfo?.result);
      } else {
        // TODO: update error in students table
      }
    } else {
      // TODO: update error in some table ??
    }

    // status should be "OK", result[] contains the required objects
  } catch (error) {
    console.error("Error while fetching CF Data in consumer :: fetchCFData()");
    console.error(errorBuilder(error));
  }
};

export default fetchCFData;
