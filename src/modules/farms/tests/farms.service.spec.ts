import config from "config/config";
import { ForbiddenError, NotFoundError, UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";
import { UsersService } from "modules/users/users.service";
import { User } from "modules/users/entities/user.entity";
import { GetFarmQueryDto } from "../dto/get-farm-query.dto";
import { SortByEnum } from "../enums/sort-by.enum";
import { GetFarmDto } from "../dto/get-farm.dto";

describe("FarmsController", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;
  let usersService: UsersService;

  let user: User;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    farmsService = new FarmsService();
    usersService = new UsersService();

    user = await usersService.createUser({ email: "test@email.com", password: "pwd", address: "New York" });
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(".createFarm", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "test", size: 1, yield: 2 };

    it("should create new Farm", async () => {
      const createdFarm = await farmsService.createFarm(createFarmDto, user);
      expect(createdFarm).toBeInstanceOf(Farm);
    });

    describe("with existing Farm", () => {
      beforeEach(async () => {
        await farmsService.createFarm(createFarmDto, user);
      });

      it("should throw UnprocessableEntityError if Farm already exists", async () => {
        await farmsService
          .createFarm({ address: createFarmDto.address, name: createFarmDto.name } as CreateFarmDto, user)
          .catch((error: UnprocessableEntityError) => {
            expect(error).toBeInstanceOf(UnprocessableEntityError);
            expect(error.message).toBe("A Farm with the same name and address is already exists.");
          });
      });
    });
  });

  describe(".findFarms", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "bp", size: 1, yield: 1 };
    const createFarmDto2: CreateFarmDto = { address: "szolnok", name: "szol", size: 2, yield: 2 };
    const createFarmDto3: CreateFarmDto = { address: "szeged", name: "szeg", size: 3, yield: 3 };
    const createFarmDto4: CreateFarmDto = { address: "sopron", name: "sop", size: 4, yield: 2 };

    const getFarmQueryDto: GetFarmQueryDto = { outliers: "true", sortBy: SortByEnum.NAME };

    it("should return GetFarmDtos", async () => {
      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);

      const farms = await farmsService.findFarms(getFarmQueryDto, user);
      farms?.forEach(farm => {
        expect(farm).toBeInstanceOf(GetFarmDto);
      });
    });

    it("should return Farms list sorted by name and excluded outliers", async () => {
      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);
      await farmsService.createFarm(createFarmDto4, user);

      const farms = await farmsService.findFarms({ outliers: "false", sortBy: SortByEnum.NAME }, user);
      if (!farms) throw new Error();
      farms.forEach(farm => {
        expect(farm?.yield).toBeLessThan(2 * 1.3);
        expect(farm?.yield).toBeGreaterThan(2 * 0.7);
      });
      expect(farms.length).toBe(2);
      expect(farms[0]).toEqual(expect.objectContaining({ name: createFarmDto4.name }));
      expect(farms[1]).toEqual(expect.objectContaining({ name: createFarmDto2.name }));
    }, 30000);

    it("should throw NotFoundError", async () => {
      await farmsService.findFarms(getFarmQueryDto, user).catch((error: NotFoundError) => {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toBe("Farms not found.");
      });
    });
  });

  describe(".deleteFarm", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "bp", size: 1, yield: 1 };

    it("should delete Farm", async () => {
      const farm = await farmsService.createFarm(createFarmDto, user);

      const deletedFarm = await farmsService.deleteFarm(farm.id, user);
      expect(deletedFarm).toEqual(
        expect.objectContaining({ name: farm.name, address: farm.address, size: farm.size, yield: farm.yield }),
      );
    });

    // it("should return Farms list sorted by name and excluded outliers", async () => {
    //   await farmsService.createFarm(createFarmDto, user);
    //   await farmsService.createFarm(createFarmDto2, user);
    //   await farmsService.createFarm(createFarmDto3, user);
    //   await farmsService.createFarm(createFarmDto4, user);

    //   const farms = await farmsService.findFarms({ outliers: "false", sortBy: SortByEnum.NAME }, user);
    //   if (!farms) throw new Error();
    //   farms.forEach(farm => {
    //     expect(farm?.yield).toBeLessThan(2 * 1.3);
    //     expect(farm?.yield).toBeGreaterThan(2 * 0.7);
    //   });
    //   expect(farms.length).toBe(2);
    //   expect(farms[0]).toEqual(expect.objectContaining({ name: createFarmDto4.name }));
    //   expect(farms[1]).toEqual(expect.objectContaining({ name: createFarmDto2.name }));
    // }, 30000);

    it("should throw NotFoundError", async () => {
      await farmsService.deleteFarm("e6035894-8012-454a-a6c6-2e8c7058ead0", user).catch((error: NotFoundError) => {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toBe("Farm not found.");
      });
    });

    it("should throw ForbiddenError", async () => {
      const farm = await farmsService.createFarm(createFarmDto, user);
      await farmsService
        .deleteFarm(farm.id, { ...user, id: "e6035894-8012-454a-a6c6-2e8c7058ead0" })
        .catch((error: NotFoundError) => {
          expect(error).toBeInstanceOf(ForbiddenError);
          expect(error.message).toBe("User is not the owner of the Farm.");
        });
    });
  });
});
