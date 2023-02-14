import { Expose, plainToClass } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import { FarmDto } from "modules/auth/dto/farm.dto";
import { Farm } from "../entities/farm.entity";

export class GetFarmDto extends FarmDto {
  constructor(partial?: Partial<GetFarmDto>) {
    super();
    Object.assign(this, partial);
  }

  @Expose()
  @IsEmail()
  @IsNotEmpty()
  public owner: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  public drivingDistance: number;

  public static createFromEntity(farm: Farm | null): GetFarmDto | null {
    if (!farm) {
      return null;
    }

    return plainToClass(GetFarmDto, farm, { strategy: "excludeAll" });
  }
}
