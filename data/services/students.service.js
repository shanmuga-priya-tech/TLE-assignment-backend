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

export const submissionStatsHandler = async (studentId, dateRange) => {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fromTimestamp = nowInSeconds - dateRange * 24 * 60 * 60;
    const baseMatch = {
      studentId: studentId,
      creationTimeSeconds: { $gte: fromTimestamp },
    };
    const solvedMatch = { ...baseMatch, verdict: "OK" };
    const totalProblemSolved = await cfSubmissionInfoModel.countDocuments(
      solvedMatch
    );

    const averageProblemPerDay = Number(
      (totalProblemSolved / dateRange).toFixed(2)
    );

    const mostDifficultSolvedProblem = await cfSubmissionInfoModel.aggregate([
      {
        $match: solvedMatch,
      },
      { $sort: { "problem.rating": -1 } },
      {
        $limit: 1,
      },
      {
        $project: {
          "problem.name": 1,
          "problem.rating": 1,
        },
      },
    ]);

    const avgRating = await cfSubmissionInfoModel.aggregate([
      {
        $match: solvedMatch,
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$problem.rating" },
        },
      },
    ]);

    return {
      totalProblemSolved,
      averageProblemPerDay,
      mostDifficultSolvedProblem:
        mostDifficultSolvedProblem[0]?.problem || null,
      avgRating: avgRating[0]?.avgRating || 0,
    };
  } catch (error) {
    console.error(
      "Error while handling Submissions data request :: submissionStatsHandler()"
    );
    throw error;
  }
};

export const submissionBarChartHandler = async (studentId, dateRange) => {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fromTimestamp = nowInSeconds - dateRange * 24 * 60 * 60;

    // Get Min Rating
    const minDoc = await cfSubmissionInfoModel
      .findOne({
        studentId: studentId,
        creationTimeSeconds: { $gte: fromTimestamp },
        verdict: "OK",
        "problem.rating": { $exists: true },
      })
      .sort({ "problem.rating": 1 })
      .limit(1);

    // Get Max Rating
    const maxDoc = await cfSubmissionInfoModel
      .findOne({
        studentId: studentId,
        creationTimeSeconds: { $gte: fromTimestamp },
        verdict: "OK",
        "problem.rating": { $exists: true },
      })
      .sort({ "problem.rating": -1 })
      .limit(1);

    const minRating = minDoc?.problem?.rating ?? 800;
    const maxRating = maxDoc?.problem?.rating ?? 2000;

    const bucketSize = 200; // Define the size of each rating bucket dynamically
    const buckets = [];

    // Generate dynamic buckets from min to max rating
    for (
      let start = Math.floor(minRating / bucketSize) * bucketSize;
      start <= maxRating;
      start += bucketSize
    ) {
      buckets.push({
        min: start,
        max: start + bucketSize - 1,
        label: `${start}-${start + bucketSize - 1}`,
        count: 0,
      });
    }

    // Aggregate rating counts grouped by problem.rating
    const ratingData = await cfSubmissionInfoModel.aggregate([
      {
        $match: {
          studentId: studentId,
          creationTimeSeconds: { $gte: fromTimestamp },
          verdict: "OK",
          "problem.rating": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$problem.rating",
          problemsSolved: { $sum: 1 },
        },
      },
    ]);

    // Fill each rating into the correct bucket
    ratingData.forEach(({ _id: rating, problemsSolved }) => {
      const bucket = buckets.find((b) => rating >= b.min && rating <= b.max);
      if (bucket) {
        bucket.count += problemsSolved;
      }
    });

    // Format the final result
    const result = buckets.map((b) => ({
      ratingBucket: b.label,
      problemsSolved: b.count,
    }));

    return result;
  } catch (error) {
    console.error(
      "Error while fetching submission bar chart :: submissionBarChartHandler()",
      error
    );
    throw error;
  }
};

export const submissionHeatMapHandler = async (studentId, dateRange) => {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const fromTimestamp = nowInSeconds - dateRange * 24 * 60 * 60;

    const heatmap = await cfSubmissionInfoModel.aggregate([
      {
        $match: {
          studentId,
          creationTimeSeconds: { $gte: fromTimestamp },
        },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: { $multiply: ["$creationTimeSeconds", 1000] } },
            },
          },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);
    return heatmap;
  } catch (error) {
    console.error(
      "Error while fetching submission HeatMap :: submissionHeatMapHandler()",
      error
    );
    throw error;
  }
};
