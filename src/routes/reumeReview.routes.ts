import { getResumeReview } from "@/controllers/resumeReview.controller";
import { Router } from "express";
import multer from "multer";

const resumeReviewRoute = Router();

const upload = multer({ dest: "uploads/" });

resumeReviewRoute.post('/', upload.single('resume'), getResumeReview);


export default resumeReviewRoute;