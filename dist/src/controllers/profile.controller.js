"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dasboard = exports.promoteUserToCoordinator = exports.getUserProfile = exports.getAllCoordinators = exports.getAllCompanies = exports.getAllStudents = exports.updateProfile = exports.getProfile = void 0;
const error_utils_1 = __importDefault(require("../utils/error.utils"));
const client_1 = require("@prisma/client");
const prisma_1 = require("@/generated/prisma");
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found, please login or register.",
            });
        }
        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                verifications: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        verifiedBy: { select: { id: true, name: true, email: true, role: true } },
                    },
                },
            },
        });
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully.",
            data: userData,
        });
    }
    catch (err) {
        console.error("Error in fetching profile:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching profile",
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found, please login.",
            });
        }
        let updatedData = {};
        let resetVerification = false;
        if (user.role === "STUDENT" || user.role === "COORDINATOR") {
            const { name, email, phone, branch, year, cgpa, activeBacklog, backlogs, resumeUrl, linkedinUrl, location, description } = req.body;
            updatedData = {
                name: name ?? user.name,
                email: email ?? user.email,
                phone: phone ?? user.phone,
                branch: branch ?? user.branch,
                year: year ?? user.year,
                cgpa: cgpa !== undefined ? Number(cgpa) : user.cgpa,
                activeBacklog: activeBacklog ?? user.activeBacklog,
                backlogs: backlogs !== undefined ? Number(backlogs) : user.backlogs,
                resumeUrl: resumeUrl ?? user.resumeUrl,
                linkedinUrl: linkedinUrl ?? user.linkedinUrl,
                location: location ?? user.location,
                description: description ?? user.description,
                verificationStatus: prisma_1.VerificationStatus.PENDING,
                verifiedProfile: false,
            };
            resetVerification = true;
        }
        if (user.role === "COMPANY") {
            const { name, email, phone, linkedinUrl, industry, description, website, founded, location, } = req.body;
            console.log("req.body: ", req.body);
            updatedData = {
                name: name ?? user.name,
                email: email ?? user.email,
                phone: phone ?? user.phone,
                linkedinUrl: linkedinUrl ?? user.linkedinUrl,
                industry: industry ?? user.industry,
                description: description ?? user.description,
                website: website ?? user.website,
                founded: founded ?? user.founded,
                location: location ?? user.location,
                verificationStatus: prisma_1.VerificationStatus.PENDING,
                verifiedProfile: false,
            };
            resetVerification = true;
        }
        // --- Prevent duplicate email/phone ---
        if (updatedData.email && updatedData.email !== user.email) {
            const emailExists = await prisma.user.findUnique({ where: { email: updatedData.email } });
            if (emailExists) {
                return next(new error_utils_1.default("Email is already in use.", 409));
            }
        }
        if (updatedData.phone && updatedData.phone !== user.phone) {
            const phoneExists = await prisma.user.findUnique({ where: { phone: updatedData.phone } });
            if (phoneExists) {
                return next(new error_utils_1.default("Phone number is already in use.", 409));
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updatedData,
        });
        // Create verification record for coordinator 
        if (resetVerification) {
            const removeVerify = await prisma.verification.create({
                data: {
                    userId: updatedUser.id,
                    status: "PENDING",
                    remarks: "Profile updated; awaiting re-verification",
                },
            });
        }
        res.status(200).json({
            success: true,
            message: "Your profile has been updated successfully.",
            data: updatedUser,
        });
    }
    catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
        });
    }
};
exports.updateProfile = updateProfile;
const getAllStudents = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator can see all the students details" });
        }
        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT"
            }
        });
        console.log("students: ", students);
        if (students.length <= 0) {
            return res
                .status(404)
                .json({ success: false, message: "Students data is not found" });
        }
        res.status(200).json({
            success: true,
            message: "Students data fetched successfully",
            data: students
        });
    }
    catch (err) {
        console.error("Error in fetching all the students:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching all the students",
        });
    }
};
exports.getAllStudents = getAllStudents;
const getAllCompanies = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator can see all the companies details" });
        }
        const companies = await prisma.user.findMany({
            where: {
                role: "COMPANY"
            }
        });
        if (companies.length <= 0) {
            return res
                .status(404)
                .json({ success: false, message: "companies data is not found" });
        }
        res.status(200).json({
            success: true,
            message: "companies data fetched successfully",
            data: companies
        });
    }
    catch (err) {
        console.error("Error in fetching all the companies:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching all the companies",
        });
    }
};
exports.getAllCompanies = getAllCompanies;
const getAllCoordinators = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator can see all the companies details" });
        }
        const coordinators = await prisma.user.findMany({});
        if (coordinators.length <= 0) {
            return res
                .status(404)
                .json({ success: false, message: "coordinators data is not found" });
        }
        res.status(200).json({
            success: true,
            message: "coordinators data fetched successfully",
            data: coordinators
        });
    }
    catch (err) {
        console.error("Error in fetching all the coordinators:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching all the coordinators",
        });
    }
};
exports.getAllCoordinators = getAllCoordinators;
const getUserProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const profileId = req.params.id;
        if (!user || (user.role !== "COORDINATOR" && user.role !== "COMPANY")) {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator and company can see all the student profile details" });
        }
        const profile = await prisma.user.findUnique({
            where: {
                id: profileId
            },
            include: {
                applications: true
            }
        });
        if (!profile) {
            return res
                .status(404)
                .json({ success: false, message: "user data is not found" });
        }
        res.status(200).json({
            success: true,
            message: "user data fetched successfully",
            data: profile
        });
    }
    catch (err) {
        console.error("Error in fetching all the user:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching all the user",
        });
    }
};
exports.getUserProfile = getUserProfile;
const promoteUserToCoordinator = async (req, res, next) => {
    try {
        const loginUser = req.user;
        const userId = req.params.id;
        if (!loginUser || loginUser.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator can promote the user" });
        }
        const userExists = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!userExists) {
            return res
                .status(404)
                .json({ success: false, message: "user is not found" });
        }
        const promotedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role: "COORDINATOR"
            }
        });
        res.status(200).json({
            success: true,
            message: "companies data fetched successfully",
            data: promotedUser
        });
    }
    catch (err) {
        console.error("Error in promoting user:", err);
        res.status(500).json({
            success: false,
            message: "Error in promoting user",
        });
    }
};
exports.promoteUserToCoordinator = promoteUserToCoordinator;
const dasboard = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({ success: false, message: "Only coordinator can promote the user" });
        }
        const totalVerifiedStudents = await prisma.user.findMany({
            where: {
                verifiedProfile: true,
                role: prisma_1.Role.STUDENT
            }
        });
        const totalVerifiedCompanies = await prisma.user.findMany({
            where: {
                verifiedProfile: true,
                role: prisma_1.Role.COMPANY
            }
        });
        const activeJobs = await prisma.job.findMany({
            where: {
                status: prisma_1.JobStatus.ACTIVE
            }
        });
        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalVerifiedStudents: totalVerifiedStudents.length,
                totalVerifiedCompanies: totalVerifiedCompanies.length,
                activeJobs: activeJobs.length,
                verifiedStudents: totalVerifiedStudents,
                verifiedCompanies: totalVerifiedCompanies,
                jobs: activeJobs
            }
        });
    }
    catch (err) {
        console.error("Error in fetching dashboard data:", err);
        res.status(500).json({
            success: false,
            message: "Error in fetching dashboard data",
        });
    }
};
exports.dasboard = dasboard;
