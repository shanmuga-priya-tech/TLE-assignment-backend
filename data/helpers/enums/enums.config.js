export const activityLabelEnums = [
  "REGISTER_USER",
  "LOGIN",
  "LOGOUT",
  "GET_USERS",
  "UPDATE_USER_INFO",
  "FETCH_STUDENTS_LIST",
  "ADD_STUDENTS",
  "GET_STUDENT",
  "UPDATE_STUDENT_INFO",
  "GET_RATINGS_GRAPH_DATA",
  "GET_CONTESTS_LIST_DATA",
  "GET_SUBMISSION_DATA",
  "GET_SUBMISSION_BARCHART",
  "GET_SUBMISSION_HEATMAP",
  "EXPORT_CSV",
  "FETCH_EXPORT_DATA",
];

export const userRoles = ["ADMIN", "STAFF"];

export const usersSortFieldEnums = [
  "userName",
  "email",
  "role",
  "status",
  "createdAt",
];

export const studentsSortFieldEnums = [
  "studentName",
  "studentEmail",
  "studentPhone",
  "studentCFHandle",
  "lastUpdated",
  "currentRating",
  "maxRating",
];

//just for reference
export const CSVFileStatus = ["processing", "generated", "failed"];
