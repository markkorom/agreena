import { IsBoolean, IsOptional, IsString } from "class-validator";

export class GetFarmQueryDto {
  @IsOptional()
  @IsString()
  public sortBy: string;

  @IsOptional()
  @IsBoolean()
  public includeOutliers: boolean;
}