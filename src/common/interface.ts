/**
 * A collection of options universally applied to parsing.
 */
export interface ParseOptions {
  /**
   *
   */
  caseInsensitive?: boolean;
}

/**
 * A union of known reporter type identifiers.
 */
export type CoverageReporterType =
  | "json"
  | "cobertura"
  | "jacoco"
  | "lcov"
  | "xccov";

export interface CommonCoverage {
  /**
   * List of files covered by tests with coverage data.
   */
  files: FileCoverage[];

  /**
   * The root directory of the project.
   */
  projectRoot?: string;

  /**
   * The name of the test suite, used in LCOV and other formats.
   */
  testSuiteName?: string;
}

/**
 * Code coverage information for a single file.
 */
export interface FileCoverage {
  /**
   * The path to the file, which may be absolute or relative to
   * the project root.
   */
  path: string;

  /**
   * A collection of individual line coverages.
   */
  lines: LineCoverage[];
}

/**
 * Code coverage data for a single line in a source file.
 */
export interface LineCoverage {
  /**
   * The line number.
   */
  number: number;

  /**
   * The number of times the line was hit during testing.
   */
  hits: number;

  /**
   * Branch coverage information for the current line.
   */
  branches: BranchCoverage[];
}

export interface BranchCoverage {
  index: number;
  hits: number;
}

export interface Id {
  /**
   * Get the named identifier for the parser/formatter.
   */
  type(): CoverageReporterType;

  /**
   * The conventional file extension used by the reporter type.
   */
  extension(): string;
}

export interface Parser {
  /**
   * Given a file path and standardized options, returns a Promise
   * for parsed coverage data. Since coverage files tend to be in
   * single digit MB or tens of MB, it's acceptable to provide the
   * full content rather than using a streaming API.
   */
  parse(content: string, options: ParseOptions): Promise<CommonCoverage>;

  /**
   * Check if the provided content is parseable by this interface.
   * @param content The content to be checked.
   */
  check(content: string): boolean;
}

export interface Formatter {
  /**
   * Format the given data as a string
   * @param data The mapped coverage data.
   */
  format(data: CommonCoverage): string;
}

export interface OverallLineCoverage {
  /**
   * The number of lines covered by tests.
   */
  coveredLines: number;

  /**
   * The number of lines not covered by tests.
   */
  uncoveredLines: number;

  /**
   * A floating point number between 0.0 and 1.0 describing the
   * overall line coverage rate (covered / total)
   */
  lineCoverageRate: number;

  /**
   * The number of branches covered by tests.
   */
  coveredBranches: number;

  /**
   * The number of branches not covered by tests.
   */
  uncoveredBranches: number;

  /**
   * A floating point number between 0.0 and 1.0 describing the
   * overall branch coverage rate (covered / total)
   */
  branchCoverageRate: number;
}

export interface Reporter extends Id, Parser, Formatter {}
