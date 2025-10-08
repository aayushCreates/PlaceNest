import { applyJob, createJob, getAllJobs, getJob, jobApplication, updateJob, updateApplicationStatus, removeJob, shortlistedStudents, getCompanyJobs, getStudentApplications, getAllJobApplications } from "@/controllers/job.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const jobRouter = Router();

// ----------- PUBLIC / COMPANY ROUTES -----------
jobRouter.get("/", isUserLoggedIn, getAllJobs);
jobRouter.get("/:id", isUserLoggedIn, getJob);

// ----------- COMPANY-SPECIFIC ROUTES -----------
jobRouter.post("/", isUserLoggedIn, createJob);
jobRouter.put("/:id", isUserLoggedIn, updateJob);
jobRouter.patch("/:id/remove", isUserLoggedIn, removeJob);
jobRouter.get("/job/company/:id", isUserLoggedIn, getCompanyJobs);

// ----------- STUDENT-SPECIFIC ROUTES -----------
jobRouter.post("/:id/apply", isUserLoggedIn, applyJob);
jobRouter.get("/application/:id", isUserLoggedIn, jobApplication);
jobRouter.get('/application/student/:id', isUserLoggedIn, getStudentApplications);

// ----------- COMPANY REVIEW ROUTES -----------
jobRouter.patch("/:id/application/status", isUserLoggedIn, updateApplicationStatus);
jobRouter.get("/:id/shortlisted", isUserLoggedIn, shortlistedStudents);
jobRouter.get('/application/job/:id', isUserLoggedIn, getAllJobApplications)


export default jobRouter;