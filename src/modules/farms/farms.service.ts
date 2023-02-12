import { UnprocessableEntityError } from "errors/errors";
import { DeleteResult, FindManyOptions, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Farm } from "./entities/farm.entity";
import { getGeocode } from "helpers/utils";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmDto): Promise<Farm> {
    // Get coordinates from GeoCode
    const geoCode = await getGeocode(data.address);

    if (!geoCode || geoCode.length === 0) throw new UnprocessableEntityError("Invalid address. Geo location not found.");

    // Default coordinates, if latitude and longitude are not provided?
    const coordinates = [geoCode[0].latitude || 0, geoCode[0].longitude || 0];

    const newFarm = this.farmsRepository.create({ ...data, coordinates });
    return this.farmsRepository.save(newFarm);
  }

  public async findFarms(options?: FindManyOptions<Farm>): Promise<Farm[] | null> {
    // TODO: sorting and filtering options
    return this.farmsRepository.find(options);
  }

  public async deleteFarm(id: string): Promise<DeleteResult | null> {
    return this.farmsRepository.delete(id);
  }
}
