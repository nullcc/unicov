module.exports = {
  roots: [""],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/test/.*\\.test.ts|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  modulePathIgnorePatterns: ["fixtures", "testSetupFile", "server"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testURL: "http://localhost/",
  testEnvironment: "node",
  rootDir: ".",
  setupFilesAfterEnv: ["./test/testSetupFile.js"],
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/src/main.ts"],
  coverageReporters: [
    // "json-summary",
    "json",
    "text",
    "lcov",
    "cobertura",
  ],
};
