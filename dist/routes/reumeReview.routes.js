"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resumeReview_controller_1 = require("@/controllers/resumeReview.controller");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const resumeReviewRoute = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
resumeReviewRoute.post('/', auth_middleware_1.isUserLoggedIn, upload.single('resume'), resumeReview_controller_1.getResumeReview);
exports.default = resumeReviewRoute;
