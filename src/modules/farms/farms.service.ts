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
import * as _ from "lodash";
import { GetFarmQueryDto } from "./dto/get-farm-query.dto";

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

  public async findFarms(acessToken: AccessToken, getFarmQueryDto: GetFarmQueryDto): Promise<GetFarmDto[] | null> {
    console.debug(getFarmQueryDto);
    const requestUser = await this.usersService.findOneBy({ id: acessToken.user.id });
    if (!requestUser) throw new NotFoundError("User not exists.");
    // TODO: sorting and filtering options
    const farms = await this.farmsRepository.createQueryBuilder("farm").leftJoinAndSelect("farm.user", "user").getMany();
    if (farms.length === 0) return [];
    const farmsCoordinates = farms.map(farm => farm.coordinates);
    const [, ...drivingDistances] = await getDrivingDistances([requestUser.coordinates, ...farmsCoordinates]);
    const farmsExtended = [];
    for (const [i, farm] of farms.entries()) {
      const { user, ...base } = farm;
      farmsExtended.push({
        ...base,
        owner: farm.user?.email,
        drivingDistance: drivingDistances[i],
      });
    }
    return _.sortBy(farmsExtended, ["nope", "name"]);
  }

  public async deleteFarm(id: string): Promise<DeleteResult | null> {
    return this.farmsRepository.delete(id);
  }
}
