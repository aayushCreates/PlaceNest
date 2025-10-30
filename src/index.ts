import express from "express";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import jobRouter from "./routes/job.routes";
import applicationRouter from "./routes/application.routes";
import verficationRoutes from "./routes/verifiation.routes";
import resumeReviewRoute from "./routes/reumeReview.routes";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:3030"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/job", jobRouter);
app.use("/application", applicationRouter);
app.use("/verification", verficationRoutes);
app.use('/resume-review', resumeReviewRoute);

app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
  res.send("hello world");
});

app.use(errorMiddleware);

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log("✅ server is running on port: " + port);
});
