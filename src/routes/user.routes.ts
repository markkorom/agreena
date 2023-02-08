import { RequestHandler, Router } from "express";
import { UsersController } from "modules/users/users.controller";

const router = Router();
const usersController = new UsersController();

router.post("/", usersController.create.bind(usersController) as RequestHandler);

export default router;
