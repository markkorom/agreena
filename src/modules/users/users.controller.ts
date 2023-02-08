import { NextFunction, Request, Response } from "express";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { UserDto } from "../auth/dto/user.dto";

export class UsersController {
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.usersService.createUser(req.body as CreateUserDto);
      res.status(201).send(UserDto.createFromEntity(user));
    } catch (error) {
      next(error);
    }
  }
}
