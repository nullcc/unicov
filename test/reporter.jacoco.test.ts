import { checkSnapshot, checkOutputSnapshot } from "./util";

import { Unicov } from "../src";

describe("Jacoco parsing and formatting", () => {
  test("Jacoco parsing", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/jacoco-coverage.xml",
      "jacoco"
    );
    checkSnapshot(unicov, "jacoco-coverage");
  });

  test("Jacoco formatting", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/lcov.info",
      "lcov"
    );
    checkOutputSnapshot(unicov, "jacoco", "jacoco-output.xml");
  });

  test("Test invalid jacoco coverage file.", async () => {
    await expect(
      Unicov.fromCoverage(
        "./test/fixtures/invalid-jacoco-coverage.xml",
        "jacoco"
      )
    ).rejects.toThrow("Invalid jacoco coverage reporter");
  });
});
