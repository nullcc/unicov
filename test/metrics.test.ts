import { Unicov } from "../src";

describe("Coverage metrics", () => {
  test("Test getOverallLineCoverage.", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/xccov-coverage.xml",
      "xccov"
    );
    expect(unicov.getOverallLineCoverage()).toEqual({
      branchCoverageRate: 1,
      coveredBranches: 0,
      coveredLines: 4,
      uncoveredBranches: 0,
      uncoveredLines: 4,
      lineCoverageRate: 0.5,
    });
  });

  test("Test getFileLineCoverage.", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "json"
    );
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 2)).toEqual(
      1
    );
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 17)).toEqual(
      2
    );
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 6)).toEqual(
      -1
    );
    expect(unicov.getFileLineCoverage("xxx.ts", 3)).toEqual(0);

    const unicov1 = await Unicov.fromCoverage(
      "./test/fixtures/json-coverage.json",
      "json"
    );
    unicov1.setCoverageData(null as any);
    expect(unicov1.getFileLineCoverage("xxx.ts", 3)).toEqual(0);
  });
});
