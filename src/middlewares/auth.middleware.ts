import { Request, Response, NextFunction } from "express";
import AppError from '../utils/error.utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

const jwtSecret = process.env.JWT_SECRET as string;
if(!jwtSecret){
    console.log("JWT secret is not found");
}

export const isUserLoggedIn = async (req: Request, res: Response, next: NextFunction)=> {
    try{
        const token = req.cookies.token;
        
        const isValidToken = jwt.verify(token, jwtSecret) as JwtPayload;

        if(!isValidToken){
            return next(new AppError("Invalid token, please login again", 400));
        }

        const userId = isValidToken.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        req.user = user;

        next();

    }catch(err){
        next(new AppError("Error in user login", 500))
    }
}


export const getJWT = async (userId: string, userRole: string)=> {
    try{
        const token = await jwt.sign({ userId, userRole }, jwtSecret);
        return token;
    }catch(err){
        console.log("Error in jwt generation.");
    }
}


export const checkValidUserByPassword = async (password, hashedPassword)=> {
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        return isValidPassword;
}