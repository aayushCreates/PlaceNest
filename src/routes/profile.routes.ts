import { Router } from "express";
import { dasboard, getAllCompanies, getAllCoordinators, getAllStudents, getProfile, getUserProfile, promoteUserToCoordinator, updateProfile, verficationProfiles, verifyProfile } from "../controllers/profile.controller";
import { isUserLoggedIn } from "../middlewares/auth.middleware";


const profileRouter = Router();

profileRouter.get('/', isUserLoggedIn , getProfile);
profileRouter.put('/', isUserLoggedIn , updateProfile);

profileRouter.get('/:id', isUserLoggedIn, getUserProfile);
profileRouter.get('/students', isUserLoggedIn, getAllStudents);
profileRouter.get('/company', isUserLoggedIn, getAllCompanies);
profileRouter.get('/coordinators', isUserLoggedIn, getAllCoordinators);
profileRouter.get('/verification', isUserLoggedIn, verficationProfiles);

profileRouter.put('/:id', isUserLoggedIn, verifyProfile);

profileRouter.put('/coordinator/user/:id/role', isUserLoggedIn, promoteUserToCoordinator);

profileRouter.get('/status/dashboard', isUserLoggedIn, dasboard);

export default profileRouter;