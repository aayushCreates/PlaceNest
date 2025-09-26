import { Router } from "express";
import { isUserLoggedIn } from "../middlewares/auth.middleware";
import { getAllJobs, getJob, postJob, updateJob } from "../controllers/job.controller";

const jobRouter = Router();

jobRouter.get('/', isUserLoggedIn, getAllJobs);
jobRouter.get('/:id', isUserLoggedIn, getJob);

jobRouter.post('/company/post-job', isUserLoggedIn, postJob);
jobRouter.put('/company/update-job/:id', isUserLoggedIn, updateJob);


export default jobRouter;