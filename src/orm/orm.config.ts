import config from "config/config";
import { DataSource, DataSourceOptions } from "typeorm";

const options: DataSourceOptions = {
  type: "postgres",
  entities: ["src/**/**/entities/**/*.ts"],
  synchronize: false,
  migrations: ["src/**/**/migrations/**/*.ts"],
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
};

export default new DataSource(options);
