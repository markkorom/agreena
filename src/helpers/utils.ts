import { DataSource } from "typeorm";
import { readdirSync } from "fs";
import path from "path";
import NodeGeocoder from "node-geocoder";
import { BadRequestError, UnprocessableEntityError } from "errors/errors";
import { validate } from "class-validator";
import { PassportRequest } from "common/passport-request.type";
import { NextFunction, Response } from "express";

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
  await ds.destroy();
};

export function transformStringToNumberInArray(arr: string[]): (string | number)[] {
  const mixedArr: (string | number)[] = [];
  for (const element of arr) {
    mixedArr.push(isNumeric(element) ? +element : element);
  }
  return mixedArr;
}

export function isStringContainsDigit(str: string): boolean {
  return /\d/.test(str);
}

/**
 * This solution is suggested here: @see: https://stackoverflow.com/a/175787/13319831
 * Convert string to num in isNaN function, because ts complained about it.
 * Do you know more elegant solution here?
 * @param str
 * @returns
 */
function isNumeric(str: string) {
  return !isNaN(+str) && !isNaN(parseFloat(str));
}

type File = string;
export function getSelectedFilesPathFromFolder(extension = "csv"): File[] {
  // Folder path could be dynamic here. I think it is good enough for this short exercise.
  return readdirSync(path.join(__dirname, "..", "..", "files")).filter(file => file.endsWith(extension));
}

const geocoder = NodeGeocoder({ provider: "openstreetmap" });
export async function getGeocodeCoordinates(address: string): Promise<number[]> {
  const geoCode = await geocoder.geocode(address);
  // Get coordinates from GeoCode

  if (!geoCode || geoCode.length === 0) throw new UnprocessableEntityError("Invalid address. Geo location not found.");

  // Default coordinates, if latitude and longitude are not provided?
  return [geoCode[0].latitude || 0, geoCode[0].longitude || 0];
}

export async function validateDto(dto: Record<string, any>): Promise<void | never> {
  const errors = await validate(dto, { validationError: { target: false, value: false }, stopAtFirstError: true });
  if (errors.length > 0) {
    // TODO: return nice, generic error messages from constraints
    const messages = JSON.stringify(errors.map(err => Object.values(err.constraints || {})));
    throw new BadRequestError(messages);
  }
}

// Quick solution to handle async middlewares.
export const asnycHandler =
  (handlerFn: (req: PassportRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: PassportRequest, res: Response, next: NextFunction) => {
    handlerFn(req, res, next).catch(next);
  };

export class ColumnNumericTransformer {
  public to(data: number): number {
    return data;
  }
  public from(data: string): number {
    return parseFloat(data);
  }
}
