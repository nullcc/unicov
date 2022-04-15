import { checkSnapshot, checkOutputSnapshot } from "./util";

import { Unicov } from "../src";

describe("Xccov parsing and formatting", () => {
  test("Xccov parsing", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/xccov-coverage.xml",
      "xccov"
    );
    checkSnapshot(unicov, "xccov-coverage");
  });

  test("Xccov formatting", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/lcov.info",
      "lcov"
    );
    checkOutputSnapshot(unicov, "xccov", "xml");
  });
});
