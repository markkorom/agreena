import { Request } from "express";
import { User } from "modules/users/entities/user.entity";

export type PassportRequest = Request & { user: User };
