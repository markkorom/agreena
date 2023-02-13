import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Sortby } from "../enums/sort-by.enum";

export class GetFarmQueryDto {
  @IsOptional()
  @IsEnum(Sortby)
  public sortBy: Sortby;

  @IsOptional()
  @IsBoolean()
  public outliers: boolean;
}
