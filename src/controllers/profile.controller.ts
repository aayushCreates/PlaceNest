import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist, please login or register.",
      });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1, // latest verification
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
    console.error("Error in getting profile:", err);
    return next(new AppError("Error in getting profile", 500));
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist, please login.",
      });
    }

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
      industry,
      description,
      website,
      founded,
      location,
    } = req.body;

    // Prepare updated data
    const updatedData: any = {
      name: name ?? user.name,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      branch: branch ?? user.branch,
      year: year ? year : user.year,
      cgpa: cgpa !== undefined ? Number(cgpa) : user.cgpa,
      activeBacklog: activeBacklog ?? user.activeBacklog,
      backlogs: backlogs !== undefined ? Number(backlogs) : user.backlogs,
      resumeUrl: resumeUrl ?? user.resumeUrl,
      industry: industry ?? user.industry,
      description: description ?? user.description,
      website: website ?? user.website,
      founded: founded ?? user.founded,
      location: location ?? user.location,
    };

    // Reset verification if non-admin/coordinator updates profile
    let resetVerification = false;
    if (user.role === "STUDENT" || user.role === "COMPANY") {
      updatedData.verificationStatus = "PENDING";
      updatedData.verifiedProfile = false;
      resetVerification = true;
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
    return next(new AppError("Error updating profile", 500));
  }
};
