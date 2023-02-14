import { NextFunction, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmsService } from "./farms.service";
import { validateDto } from "helpers/utils";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";
import { PassportRequest } from "common/passport-request.type";
import { FarmDto } from "modules/auth/dto/farm.dto";

export class FarmsController {
  private readonly farmsService: FarmsService;

  constructor() {
    this.farmsService = new FarmsService();
  }

  /**
   * Authenticated route. Create new farm entity in DB.
   */
  public async create(req: PassportRequest, res: Response, next: NextFunction) {
    try {
      const { address, name, yield: yieldDto, size } = req.body as CreateFarmDto;
      const createFarmDto = new CreateFarmDto();
      createFarmDto.address = address;
      createFarmDto.name = name;
      createFarmDto.yield = yieldDto;
      createFarmDto.size = size;

      await validateDto(createFarmDto);

      const farm = await this.farmsService.createFarm(createFarmDto, req.user);
      res.status(201).send(FarmDto.createFromEntity(farm));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated route. Return all farms.
   * The List can be sorted by name (a to z), date** (newest first), driving distance (closest first).
   * The list can be filtered by outliers (boolean).
   * outliers: the yield of a farm is 30% below or above the average yield of all farms.
   * **createdAt
   */
  public async find(req: PassportRequest, res: Response, next: NextFunction) {
    try {
      const { outliers, sortBy } = req.query as unknown as GetFarmQueryDto;
      const getFarmQueryDto = new GetFarmQueryDto();
      getFarmQueryDto.outliers = outliers;
      getFarmQueryDto.sortBy = sortBy;

      await validateDto(getFarmQueryDto);

      const farms = await this.farmsService.findFarms(getFarmQueryDto, req.user);
      res.status(200).send(farms);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated route. Delete a farm entity.
   */
  public async delete(req: PassportRequest, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.deleteFarm(req.params?.id, req.user);
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
