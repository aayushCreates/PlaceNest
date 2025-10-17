import {
  getAllJobApplications,
  getStudentApplications,
  jobApplication,
  updateApplicationStatus,
} from "@/controllers/application.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const applicationRouter = Router();

applicationRouter.get("/", isUserLoggedIn, getStudentApplications);
applicationRouter.get("/:id", isUserLoggedIn, jobApplication);
applicationRouter.patch("/:id/status", isUserLoggedIn, updateApplicationStatus);
applicationRouter.get("/job/:companyId", isUserLoggedIn, getAllJobApplications);

export default applicationRouter;
