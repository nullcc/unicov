import { Unicov } from "../src";
import { checkSnapshot, checkOutputSnapshot } from "./util";

describe("LCOV parsing and formatting", () => {
  test("LCOV parsing", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/lcov.info",
      "lcov"
    );
    checkSnapshot(unicov, "lcov-coverage");
  });

  test("LCOV formatting", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/lcov.info",
      "lcov"
    );
    checkOutputSnapshot(unicov, "lcov", "lcov-output.info");
  });
});
