import { applyJob, createJob, getAllJobs, getJob, updateJob, removeJob, shortlistedStudents, getCompanyJobs, } from "@/controllers/job.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const jobRouter = Router();

jobRouter.get("/", isUserLoggedIn, getAllJobs);
jobRouter.get("/:id", isUserLoggedIn, getJob);

jobRouter.post("/", isUserLoggedIn, createJob);
jobRouter.put("/:id", isUserLoggedIn, updateJob);
jobRouter.patch("/:id/remove", isUserLoggedIn, removeJob);
jobRouter.get("/job/company/:id", isUserLoggedIn, getCompanyJobs);

jobRouter.post("/:id/apply", isUserLoggedIn, applyJob);

jobRouter.get("/:id/shortlisted", isUserLoggedIn, shortlistedStudents);


export default jobRouter;