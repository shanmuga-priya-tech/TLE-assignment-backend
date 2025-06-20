import app from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./data/helpers/connections/mongo.connection.js";
import fetchCFData from "./data/jobs/cf_data_fetch.job.js";
import cfUserInfoQueue from "./data/queues/cf_user_info.queue.js";

config();

const startServer = async () => {
  try {
    // connect to DB
    await connectDB();

    app.listen(process.env.NODE_PORT, async () => {
      console.log(`Express started on port ${process.env.NODE_PORT}`);
      // clear backlogs
      cfUserInfoQueue.process(fetchCFData);
    });
  } catch (error) {
    console.error("Error while starting express server");
    console.error(error);
    process.exit(1);
  }
};

(async () => {
  await startServer();
})();
