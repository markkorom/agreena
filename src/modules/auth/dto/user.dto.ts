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

    return new UserDto({ ...user });
  }
}
