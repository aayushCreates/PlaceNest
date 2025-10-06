import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { describe } from "node:test";

const prisma = new PrismaClient();

export const getAllJobs = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register"
            })
        }
        
        const jobs = await prisma.job.findMany({
            where: {
                status: "Active"
            }
        });
        if(jobs.length <= 0){
            return res.status(200).json({
                success: false,
                message: "Jobs Not Found."
            })
        }

        res.status(200).json({
            success: true,
            message: "Jobs send successfully",
            data: jobs
        })

    }catch(err){
        console.log("Error in getting all jobs");
        // return next(new AppError("Error: " + err, 500));
        return res.status(500).json({
            success: false,
            message: "Error in the getting all jobs."
        })
    }
}


export const getJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists, Please register"
            })
        }

        const { jobId } = req.body;
        if(!jobId){
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists."
            })
        }

        const jobDetails = await prisma.Job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!jobId){
            return res.status(400).json({
                success: false,
                message: "Job doesn't exists."
            })
        }

        res.status(200).json({
            success: true,
            message: "Jobs send successfully",
            data: jobDetails
        })

    }catch(err){   
        console.log("Error in getting Job");
        // return next(new AppError("Error: " + err, 500));
        return res.status(500).json({
            success: false,
            message: "Error in the getting job."
        })
    }
}


export const postJob =  async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const company = req.user;
        if(!company){
            return res.status(400).json({
                success: false,
                message: "Company doesn't exists, Please register"
            })
        }

        const { type, title, description, role, location, salary, cgpaCutOff, deadline, status } = req.body;

        if(!type || !title || !description || !role || !location || !salary || !cgpaCutOff || !deadline || !status){
            return res.status(400).json({
                success: false,
                message: "Enter the required fields"
            })
        }

        const newJob = await prisma.Job.create({
            type, title, description, role, location, salary, cgpaCutOff, deadline, status, companyId: company.id
        })

        res.status(200).json({
            success: true,
            message: "Jobs send successfully",
            data: newJob
        })

    }catch(err){   
        console.log("Error in getting Job");
        // return next(new AppError("Error: " + err, 500));
        return res.status(500).json({
            success: false,
            message: "Error in the getting job."
        })
    }
}

export const updateJob =  async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Company doesn't exists, Please register"
            })
        }

        if(user.role !== 'COMPANY'){
            return res.status(401).json({
                success: true,
                message: "Unauthenticated user."
            })
        }

        const jobId = req.params?.id;
        if(!jobId){
            return res.status(400).json({
                success: false,
                message: "Job id is not exists"
            })
        }

        const job = await prisma.Job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!job){
            return res.status(400).json({
                success: false,
                message: "Job is not exists"
            })
        }

        const { type, title, description, role, location, salary, cgpaCutOff, deadline, status } = req.body;

        const updatedJobData = {
            type: type ? type : job.type,
            title: title ? title : job.title,
            description: description ? describe : job.description, 
            role: role ? role : job.role, 
            location: location ? location : job.location, 
            salary: salary ? salary : job.salary, 
            cgpaCutOff: cgpaCutOff ? cgpaCutOff : job.cgpaCutOff, 
            deadline: deadline ? deadline : job.deadline, 
            status: status ? status : job.status
        }

        const updatedJob = await prisma.Job.update({
            where: { companyId: user.id  },
            updatedJobData
        })

        res.status(200).json({
            success: true,
            message: "Jobs updated successfully",
            job: updatedJob
        })

    }catch(err){   
        console.log("Error in updating Job");
        // return next(new AppError("Error: " + err, 500));
        return res.status(500).json({
            success: false,
            message: "Error in the updating job."
        })
    }
}




