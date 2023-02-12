import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";

describe("FarmsController", () => {
  let app: Express;
  let server: Server;

  let farmsService: FarmsService;

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
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe(".createFarm", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "test", size: 1, yield: 2 };

    it("should create new Farm", async () => {
      const createdFarm = await farmsService.createFarm(createFarmDto);
      expect(createdFarm).toBeInstanceOf(Farm);
    });

    describe("with existing Farm", () => {
      beforeEach(async () => {
        await farmsService.createFarm(createFarmDto);
      });

      it("should throw UnprocessableEntityError if Farm already exists", async () => {
        await farmsService.createFarm({} as CreateFarmDto).catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("Invalid address. Geo location not found.");
        });
      });
    });
  });
});
