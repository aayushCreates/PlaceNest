import { getUsersForVerification, verifyUser } from "@/controllers/verification.controller";
import { isUserLoggedIn } from "@/middlewares/auth.middleware";
import { Router } from "express";

const verficationRoutes = Router();


verficationRoutes.get('/', isUserLoggedIn, getUsersForVerification);

verficationRoutes.put('/student/:id', isUserLoggedIn, verifyUser);




export default verficationRoutes;
