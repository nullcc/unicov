import { Unicov } from "../src";

import { checkSnapshot, checkOutputSnapshot } from "./util";

describe("Combined Unicov Functions", () => {
  test("Test fromCoverages with single coverage reporter.", async () => {
    const coverageFiles = [
      "./test/fixtures/jacoco-coverage-1.xml",
      "./test/fixtures/jacoco-coverage-2.xml",
    ];
    const unicov = await Unicov.fromCoverages(coverageFiles, "jacoco");
    checkSnapshot(unicov, "jacoco-coverage-merged");
  });

  test("Test fromCoverages with multi coverage reporters automatically.", async () => {
    const coverageFiles = [
      "./test/fixtures/json-coverage.json",
      "./test/fixtures/jacoco-coverage.xml",
      "./test/fixtures/xccov-coverage.xml",
    ];
    const unicov = await Unicov.fromCoverages(coverageFiles, "auto");
    checkSnapshot(unicov, "coverage-auto-merged");
  });
});
