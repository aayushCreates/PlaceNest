import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils";
import { PrismaClient } from "../generated/prisma";
import { JobStatus, Role, VerificationStatus } from "@/generated/prisma";

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

export const getAllStudents = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    if (!user || user.role !== "COORDINATOR") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator can see all the students details" });
    }

    const students = await prisma.user.findMany({});
    if(students.length <= 0){
      return res
      .status(404)
      .json({ success: false, message: "Students data is not found" });
    }

    res.status(200).json({
      success: true,
      message: "Students data fetched successfully",
      data: students
    })

  } catch(err){
    console.error("Error in fetching all the students:", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all the students",
    });
  }
}

export const getAllCompanies = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    if (!user || user.role !== "COORDINATOR") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator can see all the companies details" });
    }

    const companies = await prisma.user.findMany({});
    if(companies.length <= 0){
      return res
      .status(404)
      .json({ success: false, message: "companies data is not found" });
    }

    res.status(200).json({
      success: true,
      message: "companies data fetched successfully",
      data: companies
    })

  } catch(err){
    console.error("Error in fetching all the companies:", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all the companies",
    });
  }
}

export const getAllCoordinators = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    if (!user || user.role !== "COORDINATOR") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator can see all the companies details" });
    }

    const coordinators = await prisma.user.findMany({});
    if(coordinators.length <= 0){
      return res
      .status(404)
      .json({ success: false, message: "coordinators data is not found" });
    }

    res.status(200).json({
      success: true,
      message: "coordinators data fetched successfully",
      data: coordinators
    })

  } catch(err){
    console.error("Error in fetching all the coordinators:", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all the coordinators",
    });
  }
}

export const getUserProfile = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    const profileId = req.params.id;
    if (!user || user.role !== "COORDINATOR" || user.role !== "COMPANY") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator and company can see all the companies details" });
    }

    const profile = await prisma.user.findUnique({
      where: {
        id: profileId
      }
    });
    if(!profile){
      return res
      .status(404)
      .json({ success: false, message: "companies data is not found" });
    }

    res.status(200).json({
      success: true,
      message: "companies data fetched successfully",
      data: profile
    })

  } catch(err){
    console.error("Error in fetching all the companies:", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all the companies",
    });
  }
}

export const promoteUserToCoordinator = async (req: Request, res: Response, next: NextFunction)=> {
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
    if(!userExists){
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
    })

    res.status(200).json({
      success: true,
      message: "companies data fetched successfully",
      data: promotedUser
    })

  } catch(err){
    console.error("Error in promoting user:", err);
    res.status(500).json({
      success: false,
      message: "Error in promoting user",
    });
  }
}

export const dasboard = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const user = req.user;
    if (!user || user.role !== "COORDINATOR") {
      return res
        .status(403)
        .json({ success: false, message: "Only coordinator can promote the user" });
    }

    const totalVerifiedStudents = await prisma.user.findMany({
      where: {
        verifyProfile: true,
        role: Role.STUDENT
      }
    })

    const totalVerifiedCompanies = await prisma.user.findMany({
      where: {
        verifyProfile: true,
        role: Role.COMPANY
      }
    })

    const activeJobs = await prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE
      }
    })

    res.status(200).json({
      success: true,
      message: "companies data fetched successfully",
      data: promotedUser
    })

  } catch(err){
    console.error("Error in promoting user:", err);
    res.status(500).json({
      success: false,
      message: "Error in promoting user",
    });
  }
}
