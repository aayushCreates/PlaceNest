import { Request, Response, NextFunction } from "express";
import { checkValidUserByPassword, getJWT } from "../middlewares/auth.middleware";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const cookieOptions = {
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const prisma = new PrismaClient();

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
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, password and role are required.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
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
    console.error("Error during registration:", err);
    res.status(500).json({
      success: false,
      message: "Error during registration",
    });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register.",
      });
    }

    const isValidUser = await checkValidUserByPassword(password, user.password);
    if (!isValidUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Block login for unverified students/companies
    if (
      (user.role === "STUDENT" || user.role === "COMPANY") &&
      user.verificationStatus !== "APPROVED"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your profile is under verification. Please wait for coordinator approval.",
      });
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
    return res.status(500).json({
      success: false,
      message: "Error during login",
    });
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
    console.log("Error in user logout" + err);
    return res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};
