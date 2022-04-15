import { Unicov } from "../src";
import { checkSnapshot } from "./util";

describe("Content-based file detection", () => {
  test("Test fromCoverage by auto reporter.", async () => {
    // auto => json
    const unicovJson = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "auto"
    );
    checkSnapshot(unicovJson, "common-json-coverage");

    // cobertura
    const unicovCobertura = await Unicov.fromCoverage(
      "./test/fixtures/cobertura-coverage.xml",
      "auto"
    );
    checkSnapshot(unicovCobertura, "common-cobertura-coverage");

    // jacoco => json
    const unicovJacoco = await Unicov.fromCoverage(
      "./test/fixtures/jacoco-coverage.xml",
      "auto"
    );
    checkSnapshot(unicovJacoco, "jacoco-coverage");

    // auto => xccov
    const unicovXccov = await Unicov.fromCoverage(
      "./test/fixtures/xccov-coverage.xml",
      "auto"
    );
    checkSnapshot(unicovXccov, "xccov-coverage");
  });
});
