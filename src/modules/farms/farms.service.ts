import { NotFoundError } from "errors/errors";
import { DeleteResult, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { getGeocodeCoordinates } from "helpers/utils";
import { getDrivingDistances } from "helpers/driving-distance";
import { GetFarmDto } from "./dto/get-farm.dto";
import { UsersService } from "modules/users/users.service";
import { AccessToken } from "modules/auth/entities/access-token.entity";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";
import { sortBy } from "lodash";
import { Sortby } from "./enums/sort-by.enum";

type ExtendedFarm = Farm & { owner: string; drivingDistance: number };
export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly usersService: UsersService;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.usersService = new UsersService();
  }

  public async createFarm(data: CreateFarmDto, accessToken: AccessToken): Promise<Farm> {
    const user = await this.usersService.findOneBy({ id: accessToken.user.id });
    if (!user) throw new NotFoundError("User not found.");

    const newFarm = this.farmsRepository.create({ ...data, coordinates: await getGeocodeCoordinates(data.address), user });
    return this.farmsRepository.save(newFarm);
  }

  public async findFarms(accessToken: AccessToken, getFarmQueryDto: GetFarmQueryDto): Promise<GetFarmDto[] | null> {
    const farms = await this.farmsRepository.createQueryBuilder("farm").leftJoinAndSelect("farm.user", "user").getMany();
    if (farms.length === 0) return [];

    let extendedFarms = await this.getGetExtendedFarms(accessToken, farms);
    if (!getFarmQueryDto.outliers) extendedFarms = this.filterOutOutliers(extendedFarms);
    extendedFarms = sortBy(extendedFarms, getFarmQueryDto.sortBy);
    if (getFarmQueryDto.sortBy === Sortby.DATE) extendedFarms.reverse();
    return extendedFarms.map(farm => this.createGetFarmDto(farm));
  }

  public async deleteFarm(id: string): Promise<DeleteResult | null> {
    return this.farmsRepository.delete(id);
  }

  private async getDrivingDistances(accessToken: AccessToken, farms: Farm[]) {
    const requestUser = await this.usersService.findOneBy({ id: accessToken.user.id });
    if (!requestUser) throw new NotFoundError("User not exists.");
    return getDrivingDistances([requestUser.coordinates, ...farms.map(farm => farm.coordinates)]);
  }

  private async getGetExtendedFarms(accessToken: AccessToken, farms: Farm[]): Promise<ExtendedFarm[]> {
    // First element is the origin address from request user. We don't need it.
    const [, ...drivingDistances] = await this.getDrivingDistances(accessToken, farms);
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

  private createGetFarmDto(extendedFarm: ExtendedFarm) {
    const getFarmDto = new GetFarmDto();
    getFarmDto.address = extendedFarm.address;
    getFarmDto.name = extendedFarm.name;
    getFarmDto.size = extendedFarm.size;
    getFarmDto.yield = extendedFarm.yield;
    getFarmDto.owner = extendedFarm.owner;
    getFarmDto.drivingDistance = extendedFarm.drivingDistance;

    return getFarmDto;
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

  private filterOutOutliers(extendedFarms: ExtendedFarm[]) {
    const tresholds = this.getOutliersTresholds(extendedFarms.map(farm => farm.yield));
    return extendedFarms.filter(farm => farm.yield > tresholds[0] && farm.yield < tresholds[1]);
  }
}
