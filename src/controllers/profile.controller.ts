import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils";
import { prisma } from "../config/prisma";


export const getProfile = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register."
            })
        }

        res.status(200).json({
            success: true,
            message: "Your profile got successfully",
        })
    }catch(err){
        console.log("Error in getting user profile");
        // return next(new AppError("Error in getting profile", 500));
        return res.status(500).json({
            success: false,
            message: "Error in getting user profile"
        })
    }
}

export const addProfile = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register."
            })
        }

        const { name, email, phone, branch, year, cgpa, active_backlog, backlogs, resumeUrl } = req.body;

        if(!name || !email || !phone || !branch || !year || !cgpa || !active_backlog || !backlogs || !resumeUrl){
            return next(new AppError("Enter required fields", 400));
        }

        const newUser = await prisma.user.create({
            name, email, phone, branch, year, cgpa, active_backlog, backlogs, resumeUrl
        });

        res.status(200).json({
            success: true,
            message: "Your profile added successfully",
            user: newUser
        })
    }catch(err){
        console.log("Error in creation of user profile");
        // return next(new AppError("Error in creation of user profile", 500));
        return res.status(500).json({
            success: false,
            message: "Error in creation of user profile"
        })
    }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register."
            })
        }

        const { name, email, phone, branch, year, cgpa, active_backlog, backlogs, resumeUrl } = req.body;

        const updatedData = {
            name: name ? name : req.user.name,
            email: email ? email : req.user.email,
            phone: phone ? phone : req.user.phone,
            branch: branch ? branch : req.user.branch,
            year: year ? year : req.user.year,
            cgpa: cgpa ? cgpa : req.user.cgpa,
            active_backlog: active_backlog ? active_backlog : req.user.active_backlog,
            backlogs: backlogs ? backlogs : req.user.backlogs,
            resumeUrl: resumeUrl ? resumeUrl : req.user.resumeUrl
        }
        
        const updatedUser = await prisma.user.update({
            where: { email: email },
            updatedData
        });


        res.status(200).json({
            success: true,
            message: "Your profile updated successfully",
            data: updatedUser
        })
    }catch(err){
        console.log("Error in updation in profile");
        // return next(new AppError("Error in updation in profile", 500));
        return res.status(500).json({
            success: false,
            message: "Error in updation in profile"
        })
    }
}

export const deleteProfile = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register."
            })
        }

        const deletedUser = await prisma.user.delete({
            where: {
                email: user?.email
            }
        })

        res.status(200).json({
            success: true,
            message: "Your profile deleted successfully",
            deletedUser
        })
    }catch(err){
        console.log("Error in deletion of profile");
        // return next(new AppError("Error in deletion of profile", 500));
        return res.status(500).json({
            success: false,
            message: "Error in deletion of profile"
        });
    }
}



