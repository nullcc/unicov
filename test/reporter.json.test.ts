import { Unicov } from "../src";
import { JsonReporter } from "../src/reporters/json/JsonReporter";
import { checkSnapshot } from "./util";

describe("Instanbul JSON parsing", () => {
  test("JSON parsing (caseInsensitive)", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "json",
      { caseInsensitive: true }
    );
    checkSnapshot(unicov, "common-json-coverage-case-insensitive");
  });
  test("JSON parsing (default)", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "json"
    );
    checkSnapshot(unicov, "common-json-coverage");
  });
  test("JSON formatting (not implemented)", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "json"
    );
    expect(() =>
      new JsonReporter().format(unicov.getCoverageData())
    ).toThrowError("Not implemented.");
  });
});
