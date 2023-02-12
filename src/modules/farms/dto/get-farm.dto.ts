import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import { CreateFarmDto } from "./create-farm.dto";

export class GetFarm extends CreateFarmDto {
  @IsEmail()
  @IsNotEmpty()
  public owner: string;

  @IsNumber()
  @IsNotEmpty()
  public drivingDistance: number;
}