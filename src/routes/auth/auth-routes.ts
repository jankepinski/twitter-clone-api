import { Router } from "express";
import AuthController from "../../controllers/auth/auth-controller";

const AuthRouter = Router();

AuthRouter.post("/register", AuthController.register);
AuthRouter.post("/login", AuthController.login);

export default AuthRouter;
