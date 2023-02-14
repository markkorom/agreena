import assert from "assert";
import { readdirSync } from "fs";
import path from "path";

function transformStringToNumberInArray(arr: string[]): (string | number)[] {
  const mixedArr: (string | number)[] = [];
  for (const element of arr) {
    mixedArr.push(isNumeric(element) ? +element : element);
  }
  return mixedArr;
}

function isStringContainsDigit(str: string): boolean {
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
function getSelectedFilesPathFromFolder(extension = "csv"): File[] {
  return readdirSync(path.join(__dirname, "..", "files")).filter(file => file.endsWith(extension));
}

assert.deepEqual(transformStringToNumberInArray(["super", "20.5", "test", "23"]), ["super", 20.5, "test", 23]);

assert.equal(isStringContainsDigit("test-string"), false);
assert.equal(isStringContainsDigit("test-string23"), true);

assert.deepEqual(getSelectedFilesPathFromFolder(), ["export.csv", "import.csv"]);
