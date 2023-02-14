import { CreateUserDto } from "modules/users/dto/create-user.dto";

import axios from "axios";

import { faker } from "@faker-js/faker";
import { settlements } from "./hungarian-settlements.const";

function generateRandomNumber(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function generateRandomFarm(token: string): Promise<void> {
  const farm = {
    address: settlements[Math.floor(Math.random() * settlements.length - 1)],
    name: faker.word.noun(),
    size: generateRandomNumber(0.5, 1000),
    yield: generateRandomNumber(0.5, 10.0),
  };
  await axios.post("http://localhost:3000/api/v1/farms", farm, { headers: { Authorization: `Bearer ${token}` } });
}

async function seed() {
  console.info("Seed started");
  try {
    const users: CreateUserDto[] = [
      { email: "test1@user.com", password: "admin1", address: "Budapest Nánási út" },
      { email: "test2@user.com", password: "admin2", address: "Szolnok" },
      { email: "test3@user.com", password: "admin3", address: "Kecskemét" },
      { email: "test4@user.com", password: "admin4", address: "Zalaegerszeg" },
    ];

    for (const user of users) {
      await axios.post("http://localhost:3000/api/v1/users", user);
      const res = await axios.post<{ token: string }>("http://localhost:3000/api/v1/auth/login", user);

      for (let i = 0; i < 30; i++) {
        await generateRandomFarm(res.data.token);
      }
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

seed()
  .catch(err => console.error(err))
  .finally(() => console.log("Seed has been finished"));
