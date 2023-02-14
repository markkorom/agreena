import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { UsersService } from "modules/users/users.service";
import { AuthService } from "modules/auth/auth.service";
import { FarmsService } from "../farms.service";
import { GetFarmDto } from "../dto/get-farm.dto";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;
  let authService: AuthService;
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
    agent = supertest.agent(app);

    usersService = new UsersService();
    authService = new AuthService();
    farmsService = new FarmsService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /Farms", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "home", size: 2.15, yield: 0.95 };
    const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    it("should create new Farm", async () => {
      await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);
      const res = await agent.post("/api/v1/farms").auth(token, { type: "bearer" }).send(createFarmDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        address: expect.stringContaining(createFarmDto.address) as string,
        name: expect.stringContaining(createFarmDto.name) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw BadRequestError if Dto is not valid", async () => {
      await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      const res = await agent.post("/api/v1/farms").auth(token, { type: "bearer" }).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        name: "BadRequestError",
        message:
          '[["address should not be empty"],["name should not be empty"],["size should not be empty"],["yield should not be empty"]]',
      });
    });

    it("should throw UnauthorizedError if user auth failed", async () => {
      const res = await agent.post("/api/v1/farms").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized user.",
      });
    });

    it("should throw UnprocessableEntityError if Farm already exists", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);

      const res = await agent.post("/api/v1/farms").auth(token, { type: "bearer" }).send(createFarmDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A Farm with the same name and address is already exists.",
      });
    });
  });

  describe("DELETE /Farms/:id", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "home", size: 2.15, yield: 0.95 };
    const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    it("should delete Farm", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      const farm = await farmsService.createFarm(createFarmDto, user);
      const res = await agent.delete(`/api/v1/farms/${farm.id}`).auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({ name: farm.name, address: farm.address, size: farm.size, yield: farm.yield }),
      );
    });

    it("should throw BadRequestError", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      const res = await agent.delete(`/api/v1/farms/FAKE`).auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({ message: "Invalid uuid.", name: "BadRequestError" });
    });

    it("should throw NotFoundError", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      const res = await agent.delete(`/api/v1/farms/${user.id}`).auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(404);
      expect(res.body).toMatchObject({ message: "Farm not found.", name: "NotFoundError" });
    });

    it("should throw ForbiddenError error if user os not the owner of the Farm", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      await createUser({ email: "user2@test.com", password: "password", address: "Budapest" });
      const { token } = await authService.login({ email: "user2@test.com", password: "password" });

      const farm = await farmsService.createFarm(createFarmDto, user);
      const res = await agent.delete(`/api/v1/farms/${farm.id}`).auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(403);
      expect(res.body).toMatchObject({ message: "User is not the owner of the Farm.", name: "ForbiddenError" });
    });

    it("should throw UnauthorizedError if user auth failed", async () => {
      const res = await agent.delete("/api/v1/farms/123123").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized user.",
      });
    });
  });

  describe("GET /Farms", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest nánási út", name: "bp", size: 1, yield: 1 };
    const createFarmDto2: CreateFarmDto = { address: "szeged rózsa utca", name: "szeg", size: 2, yield: 2 };
    const createFarmDto3: CreateFarmDto = { address: "szolnok szérüskert", name: "szol", size: 3, yield: 3 };
    const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    it("should return all Farms", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);
      const res = await agent.get("/api/v1/farms").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      const farms = res.body as GetFarmDto[];
      farms.forEach(farm => {
        expect(farm).toHaveProperty("owner");
        expect(farm).toHaveProperty("drivingDistance");
        expect(farm).toHaveProperty("name");
        expect(farm).toHaveProperty("size");
        expect(farm).toHaveProperty("yield");
        expect(farm).toHaveProperty("address");
      });
    });

    it("should throw NotFound error", async () => {
      await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      const res = await agent.get("/api/v1/farms").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(404);
      expect(res.body).toMatchObject({ message: "Farms not found.", name: "NotFoundError" });
    });

    it("should throw BadRequestError if QueryDto is not valid", async () => {
      await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      const res = await agent.get("/api/v1/farms/?outliers=fake&sortBy=fake").auth(token, { type: "bearer" }).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        name: "BadRequestError",
        message:
          '[["sortBy must be one of the following values: name, createdAt, drivingDistance"],["outliers must be a boolean string"]]',
      });
    });

    it("should throw UnauthorizedError if user auth failed", async () => {
      const res = await agent.get("/api/v1/farms").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized user.",
      });
    });

    it("should return all Farms sorted by name (a to z)", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);
      const res = await agent.get("/api/v1/farms/?sortBy=name&outliers=true").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      const farms = res.body as GetFarmDto[];
      expect(farms[0]).toEqual(expect.objectContaining({ name: createFarmDto.name }));
      expect(farms[1]).toEqual(expect.objectContaining({ name: createFarmDto2.name }));
      expect(farms[2]).toEqual(expect.objectContaining({ name: createFarmDto3.name }));
    });

    it("should return all Farms sorted by driving distance (closest first)", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);
      const res = await agent.get("/api/v1/farms/?sortBy=drivingDistance&outliers=true").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      const farms = res.body as GetFarmDto[];
      expect(farms[0].drivingDistance).toBeLessThanOrEqual(farms[1].drivingDistance);
      expect(farms[1].drivingDistance).toBeLessThanOrEqual(farms[2].drivingDistance);
    }, 30000);

    it("should return all Farms sorted by date (newest first)", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      const farm1 = await farmsService.createFarm(createFarmDto, user);
      const farm2 = await farmsService.createFarm(createFarmDto2, user);
      const farm3 = await farmsService.createFarm(createFarmDto3, user);
      const res = await agent.get("/api/v1/farms/?sortBy=createdAt&outliers=true").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      const farms = res.body as GetFarmDto[];
      expect(farms[0]).toEqual(expect.objectContaining({ id: farm3.id }));
      expect(farms[1]).toEqual(expect.objectContaining({ id: farm2.id }));
      expect(farms[2]).toEqual(expect.objectContaining({ id: farm1.id }));
    }, 30000);

    it("should exclude outliers from the list", async () => {
      const user = await createUser({ ...loginDto, address: "Budapest" });
      const { token } = await authService.login(loginDto);

      await farmsService.createFarm(createFarmDto, user);
      await farmsService.createFarm(createFarmDto2, user);
      await farmsService.createFarm(createFarmDto3, user);
      const res = await agent.get("/api/v1/farms/?outliers=false").auth(token, { type: "bearer" }).send();

      expect(res.statusCode).toBe(200);
      const farms = res.body as GetFarmDto[];
      expect(farms.length).toEqual(1);
      expect(farms[0]).toEqual(expect.objectContaining({ yield: 2 }));
    }, 30000);
  });
});
