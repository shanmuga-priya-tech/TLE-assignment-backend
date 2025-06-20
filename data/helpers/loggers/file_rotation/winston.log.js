import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const transport = new DailyRotateFile({
  filename: "tle-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: 365,
  dirname: "logs",
  //   zippedArchive: true,
});

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    transport,
    // new transports.Console() // use it if console logs of same data are required (pm2 logs or service logs)
  ],
});

export default logger;
