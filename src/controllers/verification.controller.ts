import { VerificationStatus } from "@/generated/prisma";
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const getUsersForVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        verifiedProfile: false
      },
    });

    console.log("profile not verified: ", profiles);

    if (profiles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Pending users are not found" });
    }

    res.status(200).json({
      success: true,
      message: `Profiles fetched successfully`,
      data: profiles,
    });
  } catch (err) {
    console.error("Error in verifying user profile:", err);
    res.status(500).json({
      success: false,
      message: "Error in verifgying user profile",
    });
  }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const verificationProfileId = req.params.id;
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

    const verificationProfileDetails = await prisma.user.findUnique({
      where: {
        id: verificationProfileId,
      },
    });
    console.log("profile Details: ", verificationProfileDetails);
    if (!verificationProfileDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const updatedProfile = await prisma.user.update({
      where: {
        id: verificationProfileId,
      },
      data: {
        verifiedProfile: status === "APPROVED" ? true : false,
        verificationStatus:
          status === "APPROVED"
            ? VerificationStatus.APPROVED
            : VerificationStatus.REJECTED,
      },
    });

    console.log("update profile: ", updatedProfile);

    const verificationEntry = await prisma.verification.create({
      data: {
        userId: verificationProfileId,
        verifiedById: user.id,
        status:
          status === "APPROVED"
            ? VerificationStatus.APPROVED
            : VerificationStatus.REJECTED,
        remarks: `Profile ${status.toLowerCase()} by ${user.name}`,
      },
    });

    console.log("verifiation entry: ", verificationEntry);

    res.status(200).json({
      success: true,
      message: `Profile ${status.toLowerCase()} successfully`,
      data: updatedProfile,
    });
  } catch (err) {
    console.error("Error in verifying user profile:", err);
    res.status(500).json({
      success: false,
      message: "Error in verifying user profile",
    });
  }
};
