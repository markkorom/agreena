import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmsService } from "./farms.service";
import { AuthService } from "modules/auth/auth.service";
import { validateDto } from "helpers/utils";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";

export class FarmsController {
  private readonly farmsService: FarmsService;
  private readonly authService: AuthService;

  constructor() {
    this.farmsService = new FarmsService();
    this.authService = new AuthService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = await this.authService.validateAuthHeader(req.headers.authorization);
      const {user, ...farm} = await this.farmsService.createFarm(req.body as CreateFarmDto, accessToken);
      res.status(201).send(farm);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated route. Return all farms. 
   * The List can be sorted by name (a to z), date (newest first), driving distance (closest first).
   * The list can be filtered by outliers (boolean).
   * outliers: the yield of a farm is 30% below or above the average yield of all farms.
   * @param req 
   * @param res 
   * @param next 
   */
  public async find(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = await this.authService.validateAuthHeader(req.headers.authorization);

      const { includeOutliers, sortBy } = req.query as any;
      const getFarmQueryDto = new GetFarmQueryDto();
      getFarmQueryDto.includeOutliers = includeOutliers === 'true' ? true : false;
      getFarmQueryDto.sortBy = sortBy;

      await validateDto(getFarmQueryDto);
    
      const farms = await this.farmsService.findFarms(accessToken, getFarmQueryDto as any);
      res.status(200).send(farms);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticated route. Delete a farm entity.
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      // await this.authService.validateAuthHeader(req.headers.authorization);
      const farm = await this.farmsService.deleteFarm(req.params?.id);
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
