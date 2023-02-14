import { Expose, plainToClass, Transform } from "class-transformer";
import { Farm } from "../../farms/entities/farm.entity";

export class FarmDto {
  constructor(partial?: Partial<FarmDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Expose()
  public address: string;

  @Expose()
  public name: string;

  @Expose()
  public yield: number;

  @Expose()
  public size: number;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;

  public static createFromEntity(farm: Farm | null): FarmDto | null {
    if (!farm) {
      return null;
    }

    return plainToClass(FarmDto, farm, { strategy: "excludeAll" });
  }
}
