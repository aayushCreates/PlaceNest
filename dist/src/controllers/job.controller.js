"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyJobs = exports.shortlistedStudents = exports.applyJob = exports.removeJob = exports.updateJob = exports.createJob = exports.getJob = exports.getAllJobs = void 0;
const prisma_1 = require("@/generated/prisma");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllJobs = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists",
            });
        }
        const jobs = await prisma.job.findMany({
            where: {
                status: "ACTIVE"
            },
            include: {
                company: {
                    select: { id: true, name: true, industry: true, website: true },
                },
            },
        });
        if (jobs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No active jobs are found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
        });
    }
    catch (err) {
        console.log("Error in getting all active jobs" + err);
        res.status(500).json({
            success: false,
            message: "Error in getting all active Jobs",
        });
    }
};
exports.getAllJobs = getAllJobs;
const getJob = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists",
            });
        }
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists",
            });
        }
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    select: { id: true, name: true, industry: true, website: true },
                },
                applications: true
            },
        });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job,
        });
    }
    catch (err) {
        console.log("Error in getting job" + err);
        res.status(500).json({
            success: false,
            message: "Error in getting Job",
        });
    }
};
exports.getJob = getJob;
const createJob = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Company doesn't exists",
            });
        }
        if (user.role !== "COMPANY" || !user.verifiedProfile) {
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges",
            });
        }
        const { type, title, description, position, location, salary, cgpaCutOff, branchCutOff, yearCutOff, deadline, } = req.body;
        if (!type ||
            !title ||
            !description ||
            !position ||
            !location ||
            !salary ||
            !cgpaCutOff ||
            !deadline) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }
        const newJob = await prisma.job.create({
            data: {
                type,
                title,
                description,
                position,
                location,
                salary,
                cgpaCutOff,
                branchCutOff,
                yearCutOff,
                deadline: new Date(deadline),
                status: prisma_1.JobStatus.ACTIVE,
                companyId: user.id,
            },
        });
        res.status(200).json({
            success: false,
            message: "Job created successfully",
            data: newJob,
        });
    }
    catch (err) {
        console.log("Error in creation of new job" + err);
        res.status(500).json({
            success: false,
            message: "Error in creation of new Job",
        });
    }
};
exports.createJob = createJob;
const updateJob = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exists",
            });
        }
        if (user.role !== "COMPANY" || !user.verifiedProfile) {
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges",
            });
        }
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists",
            });
        }
        const job = await prisma.job.findFirst({
            where: {
                id: jobId,
            },
        });
        if (!job) {
            return res.status(400).json({
                success: false,
                message: "Job doesn't exists",
            });
        }
        const { type, title, description, position, location, salary, cgpaCutOff, branchCutOff, yearCutOff, deadline, status, } = req.body;
        const updatedContent = {
            type: type ? type : job.type,
            title: title ? title : job.title,
            description: description ? description : job.description,
            position: position ? position : job.position,
            location: location ? location : job.location,
            salary: salary ? salary : job.salary,
            cgpaCutOff: cgpaCutOff ? cgpaCutOff : job.cgpaCutOff,
            branchCutOff: branchCutOff ? branchCutOff : job.branchCutOff,
            yearCutOff: yearCutOff ? yearCutOff : job.yearCutOff,
            deadline: deadline ? deadline : job.deadline,
            status: status ? status : job.status,
        };
        const updatedJob = await prisma.job.update({
            where: {
                id: job.id,
            },
            data: updatedContent,
        });
        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updatedJob,
        });
    }
    catch (err) {
        console.log("Error in updating job" + err);
        res.status(500).json({
            success: false,
            message: "Error in updating Job",
        });
    }
};
exports.updateJob = updateJob;
const removeJob = async (req, res, next) => {
    try {
        const user = req.user;
        const jobId = req.params.id;
        if (!user || user.role !== "COMPANY" || !user.verifiedProfile) {
            return res
                .status(403)
                .json({ success: false, message: "Only verified companies can remove job" });
        }
        const job = await prisma.job.findUnique({
            where: {
                id: jobId,
            },
        });
        if (!job)
            return res.status(404).json({ success: false, message: "Job not found" });
        const removedJob = await prisma.job.update({
            where: {
                id: jobId,
            },
            data: {
                status: prisma_1.JobStatus.CLOSED,
            },
        });
        res.status(200).json({
            success: true,
            message: "Job removed successfully",
            data: removedJob,
        });
    }
    catch (err) {
        console.log("Error occurs during removing job", err);
        res.status(500).json({
            success: false,
            message: "Error occurs during removing job",
        });
    }
};
exports.removeJob = removeJob;
const applyJob = async (req, res, next) => {
    try {
        const user = req.user;
        const jobId = req.params.id;
        if (!user || user.role !== "STUDENT" || !user.verifiedProfile) {
            return res
                .status(403)
                .json({ success: false, message: "Only verified students can apply" });
        }
        const job = await prisma.job.findUnique({
            where: {
                id: jobId,
            },
        });
        console.log("job in apply: ", job);
        if (!job) {
            return res.status(400).json({
                success: false,
                message: "Job not found",
            });
        }
        const studentId = user.id;
        //  checking if application exits
        const isApplicationExists = await prisma.application.findUnique({
            where: {
                jobId_studentId: {
                    jobId,
                    studentId,
                },
            },
        });
        if (isApplicationExists) {
            return res
                .status(400)
                .json({ success: false, message: "Already applied for this job" });
        }
        // Eligibility checks
        const branchAllowed = job.branchCutOff.includes(user.branch);
        const yearAllowed = job.yearCutOff.includes(user.year);
        const cgpaAllowed = user.cgpa && Number(user.cgpa) >= Number(job.cgpaCutOff);
        if (!branchAllowed || !yearAllowed || !cgpaAllowed) {
            return res
                .status(400)
                .json({ success: false, message: "You are not eligible for this job" });
        }
        const newApplication = await prisma.application.create({
            data: {
                jobId: job.id,
                studentId: user.id,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Application created successfully",
            data: newApplication,
        });
    }
    catch (err) {
        console.error("Error applying for job:", err);
        res.status(500).json({ success: false, message: "Error applying for job" });
    }
};
exports.applyJob = applyJob;
const shortlistedStudents = async (req, res, next) => {
    try {
        const user = req.user;
        const jobId = req.params.id;
        if (!user || user.role === "STUDENT") {
            return res
                .status(403)
                .json({
                success: false,
                message: "Only companies and coordinators can view shortlisted students",
            });
        }
        const totalShortlistedApplications = await prisma.application.findMany({
            where: { jobId: jobId, status: "ACCEPTED" },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        branch: true,
                        year: true,
                        cgpa: true,
                        resumeUrl: true,
                        linkedinUrl: true,
                    },
                },
            },
        });
        if (totalShortlistedApplications.length === 0) {
            return res
                .status(200)
                .json({
                success: true,
                message: "No shortlisted students yet",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            message: "Shortlisted students fetched successfully",
            data: totalShortlistedApplications,
        });
    }
    catch (err) {
        console.error("Error fetching shortlisted:", err);
        res
            .status(500)
            .json({ success: false, message: "Error fetching shortlisted students" });
    }
};
exports.shortlistedStudents = shortlistedStudents;
const getCompanyJobs = async (req, res, next) => {
    try {
        const user = req.user;
        const companyId = req.params.companyId;
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found, please login" });
        }
        const company = await prisma.user.findUnique({
            where: {
                id: companyId,
            },
            include: {
                jobs: true,
            },
        });
        if (!company) {
            return res
                .status(404)
                .json({ success: false, message: "company is not found" });
        }
        if (company.jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "company jobs are not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "company jobs data fetched successfully",
            data: company.jobs,
        });
    }
    catch (err) {
        console.error("Error in fetching all jobs of the company: ", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching all jobs of the company",
        });
    }
};
exports.getCompanyJobs = getCompanyJobs;
