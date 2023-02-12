import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmDto } from "../auth/dto/farm.dto";
import { FarmsService } from "./farms.service";
import { AuthService } from "modules/auth/auth.service";

export class FarmsController {
  private readonly farmsService: FarmsService;
  private readonly authService: AuthService;

  constructor() {
    this.farmsService = new FarmsService();
    this.authService = new AuthService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    console.debug("Headers: ", req.headers)
    try {
      await this.authService.validateAuthHeader(req.headers.authorization);
      const farm = await this.farmsService.createFarm(req.body as CreateFarmDto);
      res.status(201).send(FarmDto.createFromEntity(farm));
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
    console.debug(req.headers);
    console.debug();
    try {
      await this.authService.validateAuthHeader(req.headers.authorization);
      const farms = await this.farmsService.findFarms(req.body as any);
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
      await this.authService.validateAuthHeader(req.headers.authorization);
      const farm = await this.farmsService.deleteFarm(req.params?.id);
      res.status(200).send(farm);
    } catch (error) {
      next(error);
    }
  }
}
