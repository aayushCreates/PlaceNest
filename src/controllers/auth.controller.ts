import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils";
import { prisma } from "../config/prisma";
import { checkValidUserByPassword, getJWT } from "../middlewares/auth.middleware";
import bcrypt from "bcryptjs";

const cookieOptions = {
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      branch,
      year,
      cgpa,
      backlogs,
      activeBacklogs,
      industry,
      companyDescription,
      website,
      foundedYear,
      location,
      linkedin,
      resumeUrl,
    } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return next(new AppError("Name, email, phone, password and role are required.", 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new AppError("User already exists.", 409));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Determine verification defaults
    let verificationStatus: "PENDING" | "APPROVED" = "PENDING";
    let verifiedProfile = false;

    if (role === "COORDINATOR" || role === "ADMIN") {
      verificationStatus = "APPROVED";
      verifiedProfile = true;
    }

    // Common data
    const baseData: any = {
      name,
      email,
      phone,
      password: passwordHash,
      role,
      linkedin,
      verificationStatus,
      verifiedProfile,
    };

    // Handle role-specific data
    if (role === "STUDENT" || role === "COORDINATOR") {
      Object.assign(baseData, {
        branch,
        year: year,
        cgpa: cgpa ? Number(cgpa) : null,
        backlogs: backlogs ? Number(backlogs) : null,
        activeBacklog: activeBacklogs ?? false,
        resumeUrl,
      });
    }

    if (role === "COMPANY") {
      Object.assign(baseData, {
        description: companyDescription,
        website,
        founded: foundedYear,
        location,
        industry: industry || "General",
      });
    }

    // Create user
    const newUser = await prisma.user.create({
      data: baseData,
    });

    // Automatically create verification log for students/companies
    if (role === "STUDENT" || role === "COMPANY") {
      await prisma.verification.create({
        data: {
          userId: newUser.id,
          status: "PENDING",
          remarks: "Initial verification on registration",
        },
      });
    }

    const token = getJWT(newUser.id, newUser.role);
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
      },
      token: token
    });
  } catch (err) {
    console.error("Registration error:", err);
    next(new AppError("Error during registration", 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError("User not found. Please register.", 404));
    }

    const isValidUser = await checkValidUserByPassword(password, user.password);
    if (!isValidUser) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Block login for unverified students/companies
    if (
      (user.role === "STUDENT" || user.role === "COMPANY") &&
      user.verificationStatus !== "APPROVED"
    ) {
      return next(
        new AppError(
          "Your profile is under verification. Please wait for coordinator approval.",
          403
        )
      );
    }

    const token = getJWT(user.id, user.role);
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
      token: token
    });
  } catch (err) {
    console.error("Login error:", err);
    next(new AppError("Error during login", 500));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(new AppError("Error during logout", 500));
  }
};
