import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError, UnprocessableEntityError } from "errors/errors";
import { NextFunction, Request, Response } from "express";

export function handleErrorMiddleware(error: Error, _: Request, res: Response, next: NextFunction): void {
  const { message } = error;

  if (error instanceof UnprocessableEntityError) {
    res.status(422).send({ name: UnprocessableEntityError.name, message });
  } else if (error instanceof UnauthorizedError) {
    res.status(401).send({ name: UnauthorizedError.name, message });
  } else if (error instanceof NotFoundError) {
    res.status(404).send({ name: NotFoundError.name, message });
  } else if (error instanceof BadRequestError) {
    res.status(400).send({ name: BadRequestError.name, message });
  } else if (error instanceof ForbiddenError) {
    res.status(403).send({ name: ForbiddenError.name, message });
  } else {
    res.status(500).send({ message: "Internal Server Error" });
  }

  next();
}
