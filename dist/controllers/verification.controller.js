"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.getUsersForVerification = void 0;
const prisma_1 = require("@/generated/prisma");
const prisma_2 = require("../generated/prisma");
const prisma = new prisma_2.PrismaClient();
const getUsersForVerification = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res.status(403).json({
                success: false,
                message: "Only coordinator can verify profile",
            });
        }
        const profiles = await prisma.user.findMany({
            where: {
                verificationStatus: "PENDING",
                NOT: {
                    role: "COORDINATOR",
                },
            },
        });
        console.log("profile Details: ", profiles);
        if (!profiles) {
            return res
                .status(404)
                .json({ success: false, message: "Profiles are not found" });
        }
        res.status(200).json({
            success: true,
            message: `Profiles fetched successfully`,
            data: profiles,
        });
    }
    catch (err) {
        console.error("Error in verifying user profile:", err);
        res.status(500).json({
            success: false,
            message: "Error in verifgying user profile",
        });
    }
};
exports.getUsersForVerification = getUsersForVerification;
const verifyUser = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || user.role !== "COORDINATOR") {
            return res.status(403).json({
                success: false,
                message: "Only coordinator can verify profile",
            });
        }
        const profiles = await prisma.user.findMany({
            where: {
                verificationStatus: "PENDING",
                NOT: {
                    role: "COORDINATOR",
                },
            },
        });
        console.log("profile Details: ", profiles);
        if (!profiles) {
            return res
                .status(404)
                .json({ success: false, message: "Profiles are not found" });
        }
        res.status(200).json({
            success: true,
            message: `Profiles fetched successfully`,
            data: profiles,
        });
    }
    catch (err) {
        console.error("Error in verifying user profile:", err);
        res.status(500).json({
            success: false,
            message: "Error in verifying user profile",
        });
    }
};
exports.verifyUser = verifyUser;
async (req, res, next) => {
    try {
        const user = req.user;
        const profileId = req.params.id;
        const { status } = req.body;
        if (!user || user.role !== "COORDINATOR") {
            return res
                .status(403)
                .json({
                success: false,
                message: "Only coordinator can verify profile",
            });
        }
        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification status. Must be APPROVED or REJECTED.",
            });
        }
        console.log("profileId: ", req.params.id);
        const profileDetails = await prisma.user.findUnique({
            where: {
                id: profileId,
            },
        });
        console.log("profile Details: ", profileDetails);
        if (!profileDetails) {
            return res
                .status(404)
                .json({ success: false, message: "Profile not found" });
        }
        if (profileDetails.role === "COORDINATOR") {
            return res.status(400).json({
                success: false,
                message: "Coordinator profiles cannot be verified.",
            });
        }
        const updateProfile = await prisma.user.update({
            where: {
                id: profileId,
            },
            data: {
                verifiedProfile: status === "APPROVED",
                verificationStatus: status === "APPROVED"
                    ? prisma_1.VerificationStatus.APPROVED
                    : prisma_1.VerificationStatus.REJECTED,
            },
        });
        console.log("update profile: ", updateProfile);
        const verificationEntry = await prisma.verification.create({
            data: {
                userId: profileId,
                verifiedById: user.id,
                status: status === "APPROVED"
                    ? prisma_1.VerificationStatus.APPROVED
                    : prisma_1.VerificationStatus.REJECTED,
                remarks: `Profile ${status.toLowerCase()} by ${user.name}`,
            },
        });
        console.log("verifiation entry: ", verificationEntry);
        res.status(200).json({
            success: true,
            message: `Profile ${status.toLowerCase()} successfully`,
            data: updateProfile,
        });
    }
    catch (err) {
        console.error("Error in verifying user profile:", err);
        res.status(500).json({
            success: false,
            message: "Error in verifying user profile",
        });
    }
};
