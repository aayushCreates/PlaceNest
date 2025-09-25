import { Router } from "express";
import { isUserLoggedIn } from "../middlewares/auth.middleware";
import { getAllJobs, getJobs } from "../controllers/job.controller";

const jobRouter = Router();

jobRouter.get('/', isUserLoggedIn, getAllJobs);
jobRouter.get('/:id', isUserLoggedIn, getJobs);
// jobRouter.post('')


export default jobRouter;