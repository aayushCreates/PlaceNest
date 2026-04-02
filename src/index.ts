import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import profileRouter from "./routes/profile.routes";
import jobRouter from "./routes/job.routes";
import applicationRouter from "./routes/application.routes";
import verificationRoutes from "./routes/verification.routes";
import resumeReviewRoute from "./routes/resumeReview.routes";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/job", jobRouter);
app.use("/application", applicationRouter);
app.use("/verification", verificationRoutes);
app.use("/resume-review", resumeReviewRoute);

app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
  res.send("hello world");
});

const port = process.env.PORT || 5050;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(port, () => {
      console.log("✅ server is running on port: " + port);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
