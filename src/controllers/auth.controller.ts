import { Request, Response, NextFunction } from "express";
import AppError from "../utils/error.utils"
import { prisma } from "../config/prisma";
import { checkValidUserByPassword, getJWT } from "../middlewares/auth.middleware";
import bcrypt from "bcryptjs";


const cookieOptions = {
    maxAge: 3*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}

export const register = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const { name, email, phone, password, role } = req.body;

        if(!name || !email || !password || !phone || !role){
            return next(new AppError("Enter required fields", 400));
        }

        const user = await prisma.user.findUnique({  
            where: {
                email: email
            }
          })
        if(user){
            return next(new AppError("user is already exists.", 409));
        }  

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: passwordHash,
                role 
            }
        })

        const token = getJWT(newUser.id, newUser.role);

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "user registered successfully.",
            data: {
                name: newUser.name,
                email: newUser.email,
                id: newUser.id
            }
        })

    }catch(err){
        next(new AppError("Error in the login", 500));
    }
}

export const login = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const { email, password } = req.body;
        if(!password || !email){
            return next(new AppError("Please Enter the required", 500));
        }

        const user = await prisma.user.findUnique({ 
            where: {
                email: email
            }
        });
        if(!user){
            return next(new AppError("User doesn't exists, please register", 400));
        }

        const isValidUser = await checkValidUserByPassword(password, user.password);

        if(!isValidUser){
            return next(new AppError("Invalid Creadentials", 401));
        }

        const token = await getJWT(user.id, user.role) as string;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "You have loggedin successfully"
        })

    }catch(err){
        next(new AppError("Error in the login", 500));
    }
}
export const logout = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: "You have loggedout successfully"
        })


    }catch(err){
        next(new AppError("Error in the login", 500));
    }
}
