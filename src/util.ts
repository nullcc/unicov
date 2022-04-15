import fs from "fs";
import path from "path";
import { parseString } from "xml2js";

export const checkFileExistence = (filePath: string): boolean => {
  const _filePath = resolveFilePath(filePath);
  return fs.existsSync(_filePath);
};

export const readFile = (filePath: string): string => {
  const _filePath = resolveFilePath(filePath);
  return fs.readFileSync(_filePath).toString();
};

export const resolveFilePath = (filePath: string): string => {
  if (filePath.length === 0) {
    return filePath;
  }
  if (filePath[0] === "~") {
    return path.join(process.env.HOME!, filePath.slice(1));
  }
  return filePath;
};

export const xml2json = async (content: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    parseString(content, function (err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

export const getFilePath = (
  filePath: string,
  caseInsensitive: boolean
): string => {
  if (caseInsensitive) {
    return filePath.toLowerCase();
  }
  return filePath;
};

export function sorted<T>(arr: T[]): T[] {
  const sorted = arr.slice(0);
  sorted.sort();
  return sorted;
}
