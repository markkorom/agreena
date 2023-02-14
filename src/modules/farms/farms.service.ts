import { FindOptionsWhere, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { getGeocodeCoordinates } from "helpers/utils";
import { GetFarmDto } from "./dto/get-farm.dto";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";
import { sortBy } from "lodash";
import { Sortby } from "./enums/sort-by.enum";
import { User } from "modules/users/entities/user.entity";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "errors/errors";
import axios from "axios";

type ExtendedFarm = Farm & { owner: string; drivingDistance: number };
export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly drivingDistanceBaseUrl = "http://router.project-osrm.org/table/v1/driving";

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto, user: User): Promise<Farm> {
    const existingFarm = await this.findOneBy({ address: data.address, name: data.name });
    if (existingFarm) throw new UnprocessableEntityError("A Farm with the same name and address is already exists.");
    const newFarm = this.farmsRepository.create({ ...data, coordinates: await getGeocodeCoordinates(data.address), user });
    return this.farmsRepository.save(newFarm);
  }

  public async findOneBy(param: FindOptionsWhere<Farm>): Promise<Farm | null> {
    return this.farmsRepository.findOneBy({ ...param });
  }

  public async findFarms(getFarmQueryDto: GetFarmQueryDto, user: User): Promise<(GetFarmDto | null)[] | null> {
    const farms = await this.farmsRepository.createQueryBuilder("farm").leftJoinAndSelect("farm.user", "user").getMany();
    if (farms.length === 0) throw new NotFoundError("Farms not found.");

    let extendedFarms = await this.getGetExtendedFarms(user, farms);
    if (getFarmQueryDto.outliers !== "true") extendedFarms = this.excludeOutliers(extendedFarms);
    if (getFarmQueryDto.sortBy) {
      extendedFarms = sortBy(extendedFarms, getFarmQueryDto.sortBy);
      if (getFarmQueryDto.sortBy === Sortby.DATE) extendedFarms.reverse();
    }
    return extendedFarms.map(farm => GetFarmDto.createFromEntity(farm));
  }

  public async deleteFarm(id: string, user: User): Promise<Farm> {
    const farm = await this.findOneBy({ id });
    if (!farm) throw new NotFoundError("Farm not found.");
    if (farm.userId !== user.id) throw new ForbiddenError("User is not the owner of the Farm.");

    return this.farmsRepository.remove(farm);
  }

  /**
   * Return unsorted distance array.
   * First element of the array is the starting point.
   * The array keeps the original coordinates order.
   */
  private async getDrivingDistances(user: User, farms: Farm[]): Promise<number[]> {
    const response = await axios.get<{ distances: number[][] }>(
      `${this.drivingDistanceBaseUrl}/${[user.coordinates, ...farms.map(farm => farm.coordinates)].join(
        ";",
      )}?annotations=distance`,
    );
    return response.data.distances[0];
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
