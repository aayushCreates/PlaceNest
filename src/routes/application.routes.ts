import {
  getAllJobApplications,
  getStudentApplications,
  jobApplication,
  updateApplicationStatus,
} from "@/controllers/application.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const applicationRouter = Router();

applicationRouter.get("/:id", isUserLoggedIn, jobApplication);
applicationRouter.get("/student/:id", isUserLoggedIn, getStudentApplications);
applicationRouter.patch("/:id/status", isUserLoggedIn, updateApplicationStatus);
applicationRouter.get("/job/:id", isUserLoggedIn, getAllJobApplications);

export default applicationRouter;
