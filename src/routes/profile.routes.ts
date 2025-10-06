import { Router } from "express";
import { deleteProfile, getProfile, updateProfile } from "../controllers/profile.controller";
import { isUserLoggedIn } from "../middlewares/auth.middleware";


const profileRouter = Router();

profileRouter.get('/', isUserLoggedIn , getProfile);
profileRouter.put('/', isUserLoggedIn , updateProfile);

profileRouter

export default profileRouter;