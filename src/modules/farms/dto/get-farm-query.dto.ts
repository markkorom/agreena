import { IsBooleanString, IsEnum, IsOptional } from "class-validator";
import { SortByEnum } from "../enums/sort-by.enum";

export class GetFarmQueryDto {
  @IsOptional()
  @IsEnum(SortByEnum)
  public sortBy: SortByEnum;

  @IsOptional()
  @IsBooleanString()
  public outliers: string;
}
