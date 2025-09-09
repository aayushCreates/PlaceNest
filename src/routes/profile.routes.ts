import { Router } from "express";
import { addProfile, deleteProfile, getProfile, updateProfile } from "../controllers/profile.controller";
import { isUserLoggedIn } from "../middlewares/auth.middleware";


const profileRouter = Router();

profileRouter.get('/', isUserLoggedIn , getProfile);
profileRouter.post('/', isUserLoggedIn , addProfile);
profileRouter.put('/', isUserLoggedIn , updateProfile);
profileRouter.delete('/', isUserLoggedIn , deleteProfile);


export default profileRouter;