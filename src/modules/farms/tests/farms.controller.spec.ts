import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmDto } from "../dto/create-farm.dto";
// import { FarmsService } from "../farms.service";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";
import { CreateUserDto } from "modules/users/dto/create-user.dto";
import { UsersService } from "modules/users/users.service";
import { AuthService } from "modules/auth/auth.service";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;
  let authService: AuthService;

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
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /Farms", () => {
    const createFarmDto: CreateFarmDto = { address: "budapest", name: "home", size: 2.15, yield: 0.95 };
    const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);

    it("should create new Farm", async () => {
      await createUser(loginDto);
      const { token } = await authService.login(loginDto);
      const res = await agent.post("/api/farms").auth(token, {type: "bearer"}).send(createFarmDto);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        address: expect.stringContaining(createFarmDto.address) as string,
        name: expect.stringContaining(createFarmDto.name) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw UnprocessableEntityError if Farm already exists", async () => {
      await createUser(loginDto);
      const { token } = await authService.login(loginDto);

      const res = await agent.post("/api/farms").auth(token, {type: "bearer"}).send({});

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "Invalid address. Geo location not found.",
      });
    });

    it("should throw UnauthorizedError if Farm already exists", async () => {

      const res = await agent.post("/api/farms").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized user.",
      });
    });
  });
});
