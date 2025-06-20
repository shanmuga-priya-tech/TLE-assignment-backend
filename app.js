// express, dotenv, cors, mongoose
import express, { json } from "express";
import cors from "cors";
import rotationalLogger from "./data/middlewares/winston.middleware.js";
import authRouter from "./data/routers/auth.router.js";
import { errorHandler } from "./data/helpers/errors/central_error_handler.js";
import studentRouter from "./data/routers/students.router.js";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

config();
const app = express();
const version = "v1";

console.log(process.env.FRONTEND_URL);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(json({ limit: "1mb" }));

app.use(cookieParser());
// TODO: rate-limiter

app.use(rotationalLogger);

app.use(`/api/${version}/auth`, authRouter);
app.use(`/api/${version}/students`, studentRouter);

app.use(errorHandler);

export default app;
