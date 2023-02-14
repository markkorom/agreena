import { Expose, Transform } from "class-transformer";
import { User } from "../../users/entities/user.entity";

export class UserDto {
  constructor(partial?: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Expose()
  public email: string;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;

  public static createFromEntity(user: User | null): UserDto | null {
    if (!user) {
      return null;
    }

    // I'd use plainToClass method from class-validator here and 
    // change strategy to 'excludeAll' to not return initial values such as
    // hashedPassword and coordinates. What do you think?
    return new UserDto({ ...user });
  }
}
