import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export const getAllJobs = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const jobs = await prisma.job.findMany({
            where: {
                status: "ACTIVE"
            }
        })
        if(jobs.length === 0){
            return res.status(200).json({
                success: true,
                message: "No jobs are found"
            })
        }
        
        res.status(200).json({
            success: true,
            message: "Jobs are fetched successfully",
            data: jobs
        })

    }catch (err){
        console.log("Error in getting jobs" + err);
        res.status(500).json({
            success: false,
            message: "Error in getting Jobs"
        })
    }
}
export const getJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists"
            })
        }

        const job = await prisma.job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!job){
            return res.status(400).json({
                success: false,
                message: "Job doesn't exists"
            })
        }

        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job
        })

    }catch (err){
        console.log("Error in getting job" + err);
        res.status(500).json({
            success: false,
            message: "Error in getting Job"
        })
    }
}
export const updateJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        if(user.role !== "COMPANY"){
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges"
            })
        }

        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists"
            })
        }

        const job = await prisma.job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!job){
            return res.status(400).json({
                success: false,
                message: "Job doesn't exists"
            })
        }

        const { type, title, description, position, location, salary, cgpaCutOff, branchCutOff, yearCutOff, deadline, status } = req.body;

        const updatedContent = {
            type: type ? type : job.type,
            title: title ? title : job.title,
            description: description ? description : job.description,
            position: position ? position : job.position,
            location: location ? location : job.location,
            salary: salary ? salary : job.salary,
            cgpaCutOff: cgpaCutOff ? cgpaCutOff : job.cgpaCutOff,
            branchCutOff: branchCutOff ? branchCutOff : job.branchCutOff,
            yearCutOff: yearCutOff ? yearCutOff : job.yearCutOff,
            deadline: deadline ? deadline : job.deadline,
            status: status ? status : job.status
        }

        const updatedJob = await prisma.job.update({
            where: {
                id: job.id
            },
            updatedContent
        })

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updatedJob
        })

    }catch (err){
        console.log("Error in updating job" + err);
        res.status(500).json({
            success: false,
            message: "Error in updating Job"
        })
    }
}
export const createJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        if(user.role !== "COMPANY"){
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges"
            })
        }

        const { type, title, description, position, location, salary, cgpaCutOff, branchCutOff, yearCutOff, deadline, status, companyId } = req.body;

        const newJob = await prisma.job.create({
            type, title, description, position, location, salary, cgpaCutOff, branchCutOff, yearCutOff, deadline, status, companyId
        })
        res.status(200).json({
                success: false,
                message: "Job created successfully",
                data: newJob
            })
    }catch (err){
        console.log("Error in creation of job" + err);
        res.status(500).json({
            success: false,
            message: "Error in creation of Job"
        })
    }
}
export const removeJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const jobId = req.params.id;
        if(!jobId) { 
            return res.status(400).json({
                success: false,
                message: "Job id doesn't exists"
            })
        }

        const job = await prisma.job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!job) { 
            return res.status(400).json({
                success: false,
                message: "Job doesn't exists"
            })
        }

        const updatedJob = await prisma.job.update({
            where: {
                id: jobId
            },
            status: "CLOSED"
        })

        res.status(200).json({
            success: true,
            message: "Job closed successfully",
            data: updatedJob
        })

    }catch(err) {
        console.log("Error occurs during closing job", err);
        res.status(500).json({
            success: false,
            message: "Error occurs during closing job",
        })
    }
}


export const applyJob = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const jobId = req.params.id;
        if(!jobId) { 
            return res.status(400).json({
                success: false,
                message: "job id doesn't exists"
            })
        }

        const job = await prisma.job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!job) { 
            return res.status(400).json({
                success: false,
                message: "job doesn't exists"
            })
        }

        const { studentId, mode } = req.body;
        if(!studentId || !mode){
            return res.status(400).json({
                success: false,
                message: "StudentId and mode of job doesn't exists"
            })
        }

        const studentDetails = await prisma.student.findFirst({
            where: {
                id: studentId
            }
        })
        if(!studentDetails){
            return res.status(400).json({
                success: false,
                message: "Student doesn't exists"
            })
        }

        const isStudentBranchAllowed = job.branchCutOff.length > 0 && job.branchCutOff.includes(studentDetails.branch);

        const isStudentYearAllowed = job.yearCutOff.length > 0 && job.yearCutOff.includes(studentDetails.year);

        if(studentDetails.cgpa >= job.cgpaCutOff && isStudentBranchAllowed && isStudentYearAllowed){
            const applicationDetails = {
                jobId: job.id,
                studentId: studentId,
                mode: mode
            }
    
            const createdApplication = await prisma.application.create({
                applicationDetails
            })
    
            return res.status(200).json({
                success: true,
                message: "Application created successfully",
                data: createdApplication
            })
        }

        return res.status(400).json({
            success: false,
            message: "You are not eligible for this job profile",
        })

    }catch(err) {
        console.log("Error occurs during apply job");
        res.status(500).json({
            success: false,
            message: "Error is happening in applying job",
        })
    }
}
export const jobApplication = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const applicationId = req.params.id;
        if(!applicationId) { 
            return res.status(400).json({
                success: false,
                message: "application id doesn't exits"
            })
        }

        const application = await prisma.application.findFirst({
            where: {
                id: applicationId
            },
            include: {
                job: {
                    select: {
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
                                name: true,
                                website: true
                            }
                        }
                    }
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
                        backlogs: true
                    }
                }
            }
        })
        if(!application) { 
            return res.status(400).json({
                success: false,
                message: "application doesn't exits"
            })
        }

        res.status(200).json({
            success: true,
            message: "Application got successfully",
            data: application
        })

    }catch(err) {
        console.log("Error occurs during apply job");
        res.status(500).json({
            success: false,
            message: "Error is happening in applying job",
        })
    }
}

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        if(user.role !== "COMPANY"){
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges"
            })
        }

        const jobId = req.params.id;
        if(!jobId) { 
            return res.status(404).json({
                success: false,
                message: "job id doesn't exits"
            })
        }

        const jobDetails = await prisma.job.findFirst({
            where: {
                id: jobId
            }
        })
        if(!jobDetails){
            return res.status(404).json({
                success: true,
                message: "Job doesn't exists",
            })
        }

        const { studentId, status } = req.body;

        const studentApplication = await prisma.application.findUnique({
            where: {
                jobId: jobId,
                studentId: studentId
            }
        })
        if(!studentApplication){
            return res.status(404).json({
                success: true,
                message: "No job application found for this student id"
            })
        }

        const updateStudentApplication = await prisma.application.update({
            where: {
                id: studentApplication.id
            },
            data: {
               status: status
            }
        })

        res.status(200).json({
            success: true,
            message: "Shortlisted Candidates",
            data: updateStudentApplication
        })

    }catch(err) {
        console.log("Error occurs in student shortlist");
        res.status(500).json({
            success: false,
            message: "Error occurs in student shortlist",
        })
    }
}

export const shortlistedStudents = async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const user = req.user;
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        if(user.role !== "COMPANY"){
            return res.status(401).json({
                success: false,
                message: "Insufficient privileges"
            })
        }

        const { jobId } = req.params;

        const totalApplications = await prisma.application.findMany({
            where: {
                jobId: jobId
            },
            include: {
                job: {
                    select: {
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
                                name: true,
                                website: true
                            }
                        }
                    }
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
                        backlogs: true
                    }
                }
            }
        })
        if(totalApplications.length === 0) { 
            return res.status(400).json({
                success: false,
                message: `No application found for this JobId: ${jobId}`
            })
        }

        const shortlistedStudentsData = totalApplications.filter(application=> application.status === "ACCEPTED");

        if(shortlistedStudentsData.length === 0){
            return res.status(400).json({
                success: false,
                message: `No shortlisted application found for this JobId: ${jobId}`
            })
        }

        res.status(200).json({
            success: true,
            message: "Application got successfully",
            data: shortlistedStudentsData
        })

    }catch(err) {
        console.log("Error occuring finding shortlisted students");
        res.status(500).json({
            success: false,
            message: "Error occuring finding shortlisted students",
        })
    }
}
