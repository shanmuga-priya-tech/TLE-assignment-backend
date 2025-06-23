import BullQueue from "bull";
import { config } from "dotenv";
config();

const exportQueue = new BullQueue("export", {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
});

exportQueue.on("error", (err) => {
  console.error("[Bull Queue] Error:", err);
});

exportQueue.on("waiting", (jobId) => {
  console.log(`[Bull Queue] Waiting to process job ${jobId}`);
});

export default exportQueue;
