import { config as envConfig, DotenvParseOutput } from "dotenv";
import "reflect-metadata";
import { validateConfig } from "./env.validation";

const path = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

const { error, parsed } = envConfig({ path });

if (error) {
  throw error;
}

const config = validateConfig(parsed as DotenvParseOutput);
export default config;
