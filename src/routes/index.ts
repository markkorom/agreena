import { Router } from "express";
import auth from "./auth.routes";
import user from "./user.routes";
import farm from "./farm.routes";
import { handleAuthMiddleware } from "middlewares/handle-auth.middleware";
import { asnycHandler } from "helpers/utils";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/farms", asnycHandler(handleAuthMiddleware), farm);

export default routes;
