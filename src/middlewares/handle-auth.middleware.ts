import { PassportRequest } from "common/passport-request.type";
import { UnauthorizedError } from "errors/errors";
import { NextFunction, Response } from "express";
import { AuthService } from "modules/auth/auth.service";
import { UsersService } from "modules/users/users.service";

const authService = new AuthService();
const usersService = new UsersService();

export async function handleAuthMiddleware(req: PassportRequest, _: Response, next: NextFunction): Promise<void> {
  const accessToken = await authService.validateAuthHeader(req.headers.authorization);

  const user = await usersService.findOneBy({ id: accessToken.user.id });
  if (!user) throw new UnauthorizedError("User not exists");
  req.user = accessToken.user;

  next();
}
