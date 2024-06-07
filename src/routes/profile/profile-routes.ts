import { Router } from "express";
import ProfileController from "../../controllers/profile/profile-controller";

const ProfileRouter = Router();

ProfileRouter.get("/me", ProfileController.getMyProfile);
ProfileRouter.get("/:id", ProfileController.getProfile);
ProfileRouter.patch("/", ProfileController.updateProfile);

export default ProfileRouter;
