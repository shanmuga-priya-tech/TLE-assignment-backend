import cfRatingInfoModel from "../models/cf_rating_info.model.js";
import cfSubmissionInfoModel from "../models/cf_submission_info.model.js";
import studentModel from "../models/student.model.js";
import cfUserInfoQueue from "../queues/cf_user_info.queue.js";

export const getStudentListHandler = async (pagination, filters, sort) => {
  try {
    const aggregationStages = [];

    if (filters.searchText) {
      aggregationStages.push({
        $match: {
          $or: [
            { studentName: { $regex: filters.searchText, $options: "i" } },
            { studentEmail: { $regex: filters.searchText, $options: "i" } },
            { studentPhone: { $regex: filters.searchText, $options: "i" } },
            { studentCFHandle: { $regex: filters.searchText, $options: "i" } },
          ],
        },
      });
    }

    // TODO: join CF info table
    // Temp
    // aggregationStages.push({
    //   $addFields: {
    //     currentRating: null,
    //     maxRating: null,
    //   },
    // });

    aggregationStages.push({
      $lookup: {
        from: "cfuserinfos",
        localField: "_id",
        foreignField: "studentId",
        as: "result",
      },
    });

    aggregationStages.push({
      $unwind: {
        path: "$result",
        preserveNullAndEmptyArrays: true,
      },
    });

    aggregationStages.push({
      $addFields: {
        currentRating: { $ifNull: ["$result.rating", null] },
        maxRating: { $ifNull: ["$result.maxRating", null] },
      },
    });

    aggregationStages.push({
      $unset: "result",
    });

    aggregationStages.push({
      $sort: {
        [sort.sortField]: sort.sortDirection,
      },
    });

    aggregationStages.push({
      $skip: (pagination.pageNo - 1) * pagination.limitPerPage,
    });

    aggregationStages.push({ $limit: pagination.limitPerPage });

    const countAggregationStages = [...aggregationStages];
    countAggregationStages.splice(-7); //Remove join related stages, sort, skip and limit

    countAggregationStages.push({
      $count: "count",
    });

    const [studentsResult, countResult] = await Promise.all([
      studentModel.aggregate(aggregationStages),
      studentModel.aggregate(countAggregationStages),
    ]);

    let totalCount = countResult.length === 1 ? countResult[0]?.count || 0 : 0;

    return {
      students: studentsResult,
      totalCount: totalCount,
    };
  } catch (error) {
    console.error(
      "Error while handling get students list request :: getStudentListHandler()"
    );
    throw error;
  }
};

export const addStudentsHandler = async (students) => {
  try {
    const duplicateRequests = [];
    const successRequests = [];
    const failedRequests = [];

    // TODO: Update logic to BULK INSERT based on for performance

    // Iterate and push to DB and job queue
    for (const student of students) {
      try {
        // check for CFHandle based duplicates
        const existingCFHandle = await studentModel.findOne({
          studentCFHandle: student["studentCFHandle"],
        });
        if (existingCFHandle) {
          duplicateRequests.push(student);
          continue;
        }
        // push to DB
        const studentRecord = await studentModel.create(student);

        // push to queue
        await cfUserInfoQueue.add(
          {
            _id: studentRecord._id,
            cfHandle: student["studentCFHandle"],
          },
          {
            delay: 5000, // each job will run with a sleep time of 5 sec in btw
            attempts: 3,
          }
        );

        successRequests.push(student);
      } catch (error) {
        failedRequests.push(student);
      }
    }

    return {
      successRequests: successRequests,
      duplicateRequests: duplicateRequests,
      failedRequests: failedRequests,
    };
  } catch (error) {
    console.error(
      "Error while handling add students request :: addStudentsHandler()"
    );
    throw error;
  }
};

export const ratingsGraphHandler = async (studentId, dateRange) => {
  try {
    const aggregationStages = [];

    aggregationStages.push({
      $match: {
        studentId: studentId,
      },
    });

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fromTimestamp = nowInSeconds - dateRange * 24 * 60 * 60;
    aggregationStages.push({
      $match: {
        ratingUpdateTimeSeconds: { $gte: fromTimestamp },
      },
    });

    aggregationStages.push({
      $addFields: {
        ratingUpdateTimestampISO: {
          $toDate: {
            $multiply: ["$ratingUpdateTimeSeconds", 1000],
          },
        },
      },
    });

    aggregationStages.push({
      $sort: {
        ratingUpdateTimeSeconds: 1,
      },
    });

    const graphData = await cfRatingInfoModel.aggregate(aggregationStages);
    return graphData;
  } catch (error) {
    console.error(
      "Error while handling ratings graph data request :: ratingsGraphHandler()"
    );
    throw error;
  }
};

export const contestsListHandler = async (studentId, dateRange, pagination) => {
  try {
    // TODO: optimise queries with compund indexes
    const aggregationStages = [];

    aggregationStages.push({
      $match: {
        studentId: studentId,
      },
    });

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fromTimestamp = nowInSeconds - dateRange * 24 * 60 * 60;
    aggregationStages.push({
      $match: {
        ratingUpdateTimeSeconds: { $gte: fromTimestamp },
      },
    });

    aggregationStages.push({
      $sort: {
        ratingUpdateTimeSeconds: -1,
      },
    });

    aggregationStages.push({
      $skip: (pagination.pageNo - 1) * pagination.limitPerPage,
    });

    aggregationStages.push({ $limit: pagination.limitPerPage });

    const countAggregationStages = [...aggregationStages];
    countAggregationStages.splice(-3); //Remove sort, skip and limit

    countAggregationStages.push({
      $count: "count",
    });

    const [contestsList, countResult] = await Promise.all([
      cfRatingInfoModel.aggregate(aggregationStages),
      cfRatingInfoModel.aggregate(countAggregationStages),
    ]);

    let totalCount = countResult.length === 1 ? countResult[0]?.count || 0 : 0;

    const contestIds = contestsList.map((contest) => contest.contestId);

    const aggregationStages2 = [];

    aggregationStages2.push({
      $match: {
        studentId: studentId,
      },
    });

    aggregationStages2.push({
      $match: {
        contestId: { $in: contestIds },
      },
    });

    aggregationStages2.push({
      $group: {
        _id: {
          contestId: "$problem.contestId",
          index: "$problem.index",
        },
        verdicts: { $addToSet: "$verdict" },
      },
    });

    aggregationStages2.push({
      $match: {
        verdicts: { $not: { $in: ["OK"] } },
      },
    });

    aggregationStages2.push({
      $group: {
        _id: "$_id.contestId",
        count: { $sum: 1 },
      },
    });

    const unsolvedProblemsResult = await cfSubmissionInfoModel.aggregate(
      aggregationStages2
    );

    contestsList.forEach((contest) => {
      const index = unsolvedProblemsResult.findIndex(
        (el) => el._id == contest.contestId
      );
      if (index != -1) {
        contest["unsolvedProblemsCount"] =
          unsolvedProblemsResult[index]["count"];
      } else {
        contest["unsolvedProblemsCount"] = 0;
      }
    });

    return {
      contestsList: contestsList,
      totalCount: totalCount,
    };
  } catch (error) {
    console.error(
      "Error while handling contests list data request :: contestsListHandler()"
    );
    throw error;
  }
};
