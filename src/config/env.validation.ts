import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { EnvironmentVariables } from "./environment-variables";

export function validateConfig(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errMessages: string[] = [];

    errors.forEach(e => {
      const errConstraints = e.constraints as { [type: string]: string };

      for (const [, errMessage] of Object.entries(errConstraints)) {
        errMessages.push(errMessage);
      }
    });

    throw new Error(`Config initialization error: \n${errMessages.join(",\n")}`);
  }

  return validatedConfig;
}
