import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils";
import { PrismaClient } from "@prisma/client";
import { VerificationStatus } from "@/generated/prisma";

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (err) {
    console.error("Error in fetching profile:", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching profile",
    });
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found, please login.",
      });
    }

    let updatedData: any = {};
    let resetVerification = false;

    if (user.role === "STUDENT" || user.role === "COORDINATOR") {
      const {
        name,
        email,
        phone,
        branch,
        year,
        cgpa,
        activeBacklog,
        backlogs,
        resumeUrl,
        linkedinUrl,
        location,
      } = req.body;

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
        verificationStatus: VerificationStatus.PENDING,
        verifiedProfile: false,
      };

      resetVerification = true;
    }

    if (user.role === "COMPANY") {
      const {
        name,
        email,
        phone,
        linkedinUrl,
        industry,
        description,
        website,
        founded,
        location,
      } = req.body;

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
        verificationStatus: VerificationStatus.PENDING,
        verifiedProfile: false,
      };

      resetVerification = true;
    }

    // --- Prevent duplicate email/phone ---
    if (updatedData.email && updatedData.email !== user.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: updatedData.email } });
      if (emailExists) {
        return next(new AppError("Email is already in use.", 409));
      }
    }
    if (updatedData.phone && updatedData.phone !== user.phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone: updatedData.phone } });
      if (phoneExists) {
        return next(new AppError("Phone number is already in use.", 409));
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatedData,
    });

    // Create verification record for coordinator 
    if (resetVerification) {
      await prisma.verification.create({
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
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

export const verifyProfile = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    const profileId = req.params.id;
    const { status } = req.body;
    if (!user || user.role !== "COORDINATOR") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator can verify profile" });
    }
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status. Must be APPROVED or REJECTED.",
      });
    }

    const profileDetails = await prisma.user.findUnique({
      where: {
        id: profileId
      }
    })
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
        id: profileId
      },
      data: {
        verifiedProfile: status === "APPROVED",
        verificationStatus:
          status === "APPROVED"
            ? VerificationStatus.APPROVED
            : VerificationStatus.REJECTED,
      }
    })

    const verificationEntry = await prisma.verification.create({
      data: {
        userId: profileId,
        verifiedById: user.id,
        status:
          status === "APPROVED"
            ? VerificationStatus.APPROVED
            : VerificationStatus.REJECTED,
        remarks: `Profile ${status.toLowerCase()} by ${user.name}`,
      },
    })

    res.status(200).json({
      success: true,
      message: `Profile ${status.toLowerCase()} successfully`,
      data: updateProfile
    })

  } catch(err){
    console.error("Error in verifying user profile:", err);
    res.status(500).json({
      success: false,
      message: "Error in verifying user profile",
    });
  }
}