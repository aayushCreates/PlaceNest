import { PrismaClient } from "../generated/prisma";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const jobApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const applicationId = req.params.id;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
      },
      include: {
        job: {
          include: {
            type: true,
            title: true,
            position: true,
            location: true,
            salary: true,
            cgpaCutOff: true,
            branchCutOff: true,
            yearCutOff: true,
            deadline: true,
            status: true,
            company: {
              select: {
                id: true,
                name: true,
                website: true,
              },
            },
          },
        },
        student: {
          select: {
            name: true,
            email: true,
            phone: true,
            branch: true,
            year: true,
            cgpa: true,
            resumeUrl: true,
            linkedinUrl: true,
            activeBacklog: true,
            backlogs: true,
          },
        },
      },
    });
    if (!application) {
      return res.status(400).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data: application,
    });
  } catch (err) {
    console.log("Error in fetching job");
    res.status(500).json({
      success: false,
      message: "Error in fetching job",
    });
  }
};

export const getStudentApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found, please login" });
    }

    const studentApplications = await prisma.application.findMany({
      where: {
        id: user.id,
      },
      include: {
        job: true,
      },
    });
    console.log("student applications: ", studentApplications);
    if (studentApplications.length === 0) {
      return res
        .status(200)
        .json({
          success: false,
          message: "student applications is not found",
          data: studentApplications,
        });
    }

    res.status(200).json({
      success: true,
      message: "company jobs data fetched successfully",
      data: studentApplications,
    });
  } catch (err) {
    console.error("Error in fetching all applications of the student: ", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all applications of the student",
    });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const jobId = req.params.id;
    const { studentId, status } = req.body;

    if (!user || user.role !== "COMPANY") {
      return res
        .status(403)
        .json({ success: false, message: "Only companies can update status" });
    }

    if(!user.verifiedProfile){
      return res.status(404).json({
        success: false,
        message: "Your profile is not verified"
      })
    }

    const jobDetails = await prisma.job.findFirst({
      where: {
        id: jobId,
      },
    });
    if (!jobDetails) {
      return res.status(404).json({
        success: true,
        message: "Job not found",
      });
    }

    const studentApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId,
          studentId,
        },
      },
    });
    if (!studentApplication) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const updateStudentApplication = await prisma.application.update({
      where: {
        id: studentApplication.id,
      },
      data: {
        status: status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: updateStudentApplication,
    });
  } catch (err) {
    console.log("Error updating status" + err);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export const getAllJobApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const jobId = req.params.companyId;
    if (!user || (user.role !== "COMPANY" && user.role !== "COORDINATOR")) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Only companies and coordinators can get the job applications",
        });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        applications: {
          include: {
            student: true
          },
        },
      },
    });
    console.log("Job: ", job);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "job is not found" });
    }

    res.status(200).json({
      success: true,
      message: "company jobs data fetched successfully",
      data: job.applications,
    });
  } catch (err) {
    console.error("Error in fetching all applications of the job: ", err);
    res.status(500).json({
      success: false,
      message: "Error in fetching all applications of the job",
    });
  }
};
