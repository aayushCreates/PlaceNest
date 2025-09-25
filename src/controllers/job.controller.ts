import { NextFunction } from "express";
import AppError from "../utils/error.utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllJobs = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        
        const jobs = await prisma.job.findMany({
            where: {
                status: "Active"
            }
        });
        if(!jobs.length<=0){
            res.status(200).json({
                success: false,
                message: "Jobs Not Found."
            })
        }

        res.status(200).json({
            success: true,
            message: "Jobs send successfully"
        })

    }catch(err){
        console.log("Error in getting all jobs");
        return next(new AppError("Error: " + err, 500));
    }
}


export const getJobs = async (req: Request, res: Response, next: NextFunction)=> {
    try {

    }catch(err){
        console.log("Error in getting Job");
        return next(new AppError("Error: " + err, 500));
    }
}







