import { RequestHandler, Router } from "express";
import { AuthController } from "modules/auth/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login.bind(authController) as RequestHandler);

export default router;
