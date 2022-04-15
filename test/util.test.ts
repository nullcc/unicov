import * as fs from "fs";
import * as util from "../src/util";

describe("util.ts", () => {
  describe("getFilePath", () => {
    test("empty path", () => {
      expect(util.getFilePath("", false)).toEqual("");
    });
  });
  describe("resolveFilePath", () => {
    test("empty path", () => {
      expect(util.resolveFilePath("")).toEqual("");
    });
    test("home path", () => {
      const HOME = process.env.HOME;
      expect(util.resolveFilePath("~/foo")).toEqual(`${HOME}/foo`);
    });
  });
  describe("xml2json", () => {
    test("Invalid XML", async () => {
      const promise = util.xml2json(">>FOOBAR<<");
      expect.assertions(1);
      return expect(promise).rejects.toThrowError(
        "Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: >"
      );
    });
  });
});
