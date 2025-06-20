// {
//       "id": 157298399,
//       "contestId": 1677,
//       "creationTimeSeconds": 1652613839,
//       "relativeTimeSeconds": 2147483647,
//       "problem": {
//         "contestId": 1677,
//         "index": "A",
//         "name": "Tokitsukaze and Strange Inequality",
//         "type": "PROGRAMMING",
//         "points": 500,
//         "rating": 1600,
//         "tags": [
//           "brute force",
//           "data structures",
//           "dp"
//         ]
//       },
//       "author": {
//         "contestId": 1677,
//         "participantId": 133161991,
//         "members": [
//           {
//             "handle": "Fefer_Ivan"
//           }
//         ],
//         "participantType": "PRACTICE",
//         "ghost": false,
//         "startTimeSeconds": 1652020500
//       },
//       "programmingLanguage": "C++17 (GCC 7-32)",
//       "verdict": "OK",
//       "testset": "TESTS",
//       "passedTestCount": 68,
//       "timeConsumedMillis": 171,
//       "memoryConsumedBytes": 202240000
//     },

import { Schema, model } from "mongoose";

const cfSubmissionInfoSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    creationTimeSeconds: {
      type: Number,
      required: true,
    },
    relativeTimeSeconds: {
      type: Number,
      required: true,
    },
    problem: {
      type: Object, //TODO: Avoid dynamic objects, validate properly
      required: true,
    },
    author: {
      type: Object, //TODO: Avoid dynamic objects, validate properly
      required: true,
    },
    programmingLanguage: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      required: true,
    },
    testset: {
      type: String,
      required: true,
    },
    passedTestCount: {
      type: Number,
      required: true,
    },
    timeConsumedMillis: {
      type: Number,
      required: true,
    },
    memoryConsumedBytes: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const cfSubmissionInfoModel = model("cfSubmissionInfo", cfSubmissionInfoSchema);
export default cfSubmissionInfoModel;
