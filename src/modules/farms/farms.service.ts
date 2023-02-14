import { DeleteResult, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { getGeocodeCoordinates } from "helpers/utils";
import { getDrivingDistances } from "helpers/driving-distance";
import { GetFarmDto } from "./dto/get-farm.dto";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";
import { sortBy } from "lodash";
import { Sortby } from "./enums/sort-by.enum";
import { User } from "modules/users/entities/user.entity";
import { NotFoundError } from "errors/errors";

type ExtendedFarm = Farm & { owner: string; drivingDistance: number };
export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto, user: User): Promise<Farm> {
    const newFarm = this.farmsRepository.create({ ...data, coordinates: await getGeocodeCoordinates(data.address), user });
    return this.farmsRepository.save(newFarm);
  }

  public async findFarms(getFarmQueryDto: GetFarmQueryDto, user: User): Promise<(GetFarmDto | null)[] | null> {
    const farms = await this.farmsRepository.createQueryBuilder("farm").leftJoinAndSelect("farm.user", "user").getMany();
    if (farms.length === 0) throw new NotFoundError('Farms not found.');

    let extendedFarms = await this.getGetExtendedFarms(user, farms);
    if (getFarmQueryDto.outliers !== 'true') extendedFarms = this.excludeOutliers(extendedFarms);
    if (getFarmQueryDto.sortBy) {
      extendedFarms = sortBy(extendedFarms, getFarmQueryDto.sortBy);
      if (getFarmQueryDto.sortBy === Sortby.DATE) extendedFarms.reverse();
    }
    return extendedFarms.map((farm) => GetFarmDto.createFromEntity(farm));
  }

  public async deleteFarm(id: string): Promise<DeleteResult | null> {
    return this.farmsRepository.delete(id);
  }

  private async getDrivingDistances(user: User, farms: Farm[]): Promise<number[]> {
    return getDrivingDistances([user.coordinates, ...farms.map(farm => farm.coordinates)]);
  }

  private async getGetExtendedFarms(user: User, farms: Farm[]): Promise<ExtendedFarm[]> {
    // First element is the origin address from request user. We don't need it.
    const [, ...drivingDistances] = await this.getDrivingDistances(user, farms);
    const extendedFarms = [];

    for (const [i, farm] of farms.entries()) {
      extendedFarms.push({
        ...farm,
        owner: farm.user?.email || "",
        drivingDistance: drivingDistances[i],
      });
    }

    return extendedFarms;
  }

  /**
   * outliers = the yield of a farm is 30% below or above of the average yield of all farms
   * @param yields
   * Return array with min and max outliers treshold. [min, max]
   */
  private getOutliersTresholds(yields: number[]): number[] {
    const average = yields.reduce((a: number, b: number) => a + b) / yields.length;
    return [average * 0.7, average * 1.3];
  }

  private excludeOutliers(extendedFarms: ExtendedFarm[]): ExtendedFarm[] {
    const tresholds = this.getOutliersTresholds(extendedFarms.map(farm => farm.yield));
    return extendedFarms.filter(farm => farm.yield > tresholds[0] && farm.yield < tresholds[1]);
  }
}
