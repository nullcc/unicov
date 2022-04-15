import { Unicov } from "../src";

describe("Error handling", () => {
  test("Test unknown coverage reporter.", async () => {
    await expect(
      Unicov.fromCoverage("./test/fixtures/json-coverage.json", "xxx" as any)
    ).rejects.toThrow("Unknown coverage reporter 'xxx'");
  });

  test("Test coverage file not found.", async () => {
    await expect(
      Unicov.fromCoverage("./test/fixtures/x.json", "json")
    ).rejects.toThrow("Coverage file not found: ./test/fixtures/x.json!");
  });

  test("Test invalid json coverage file.", async () => {
    await expect(
      Unicov.fromCoverage("./test/fixtures/invalid-json-coverage.json", "json")
    ).rejects.toThrow("Invalid json coverage reporter");
  });
});
