import { getResumeReview } from "@/controllers/resumeReview.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";
import multer from "multer";

const resumeReviewRoute = Router();

const upload = multer({ dest: "uploads/" });

resumeReviewRoute.post('/', isUserLoggedIn, upload.single('resume'), getResumeReview);


export default resumeReviewRoute;