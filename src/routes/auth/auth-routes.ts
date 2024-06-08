import { Router } from "express";
import AuthController from "../../controllers/auth/auth-controller";

const AuthRouter = Router();

AuthRouter.post("/register", AuthController.register);
AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/logout", AuthController.logout);
AuthRouter.get("/me", AuthController.getMyProfile);

export default AuthRouter;
