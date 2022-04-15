import * as _ from "lodash";
import fs from "fs";
import {
  ParseOptions,
  CoverageReporterType,
  CommonCoverage,
  OverallLineCoverage,
  FileCoverage,
  LineCoverage,
  BranchCoverage,
  Formatter,
} from "./interface";
import { JsonReporter } from "../reporters/json/JsonReporter";
import { CoberturaReporter } from "../reporters/cobertura/CoberturaReporter";
import { JacocoReporter } from "../reporters/jacoco/JacocoReporter";
import { XccovReporter } from "../reporters/xccov/XccovReporter";
import * as util from "../util";
import { Reporter } from "./interface";
import { LcovReporter } from "../reporters/lcov/LcovReporter";

const REPORTERS: Reporter[] = [
  new CoberturaReporter(),
  new JacocoReporter(),
  new JsonReporter(),
  new LcovReporter(),
  new XccovReporter(),
];

export class Unicov {
  private coverageData: CommonCoverage;

  private constructor(coverageData: CommonCoverage) {
    this.coverageData = coverageData;
  }

  /**
   * Get Unicov instance by coverage files and coverage reporter type.
   * @param coverageFiles
   * @param reporterType
   */
  static async fromCoverages(
    coverageFiles: string[],
    reporterType: CoverageReporterType | "auto" = "auto",
    options: ParseOptions = {}
  ): Promise<Unicov> {
    const coverages = await Promise.all(
      coverageFiles.map(async (file) =>
        Unicov.fromCoverage(file, reporterType, options)
      )
    );
    return Unicov.merge(coverages);
  }

  /**
   * Get Unicov instance by coverage file and coverage reporter type.
   * @param coverageFile
   * @param reporterType
   */
  static async fromCoverage(
    coverageFile: string,
    reporterType: CoverageReporterType | "auto",
    options: ParseOptions = {}
  ): Promise<Unicov> {
    if (!util.checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}!`);
    }
    let type = reporterType;
    let reporter = Unicov.getReporter(reporterType);
    if (type === "auto") {
      reporter = Unicov.detectReporter(coverageFile);
    }
    if (!reporter) {
      throw new Error(`Unknown coverage reporter '${type}'`);
    }
    const coverageData = await reporter.parse(
      util.readFile(coverageFile),
      options
    );
    return new Unicov(coverageData);
  }

  /**
   * Merges multi unicovs
   * @param items
   */
  static merge(items: Unicov[]): Unicov {
    const combined: CommonCoverage = { files: [] };
    const fileMap: { [k: string]: FileCoverage } = {};

    function mergeLines(a: LineCoverage[], b: LineCoverage[]): LineCoverage[] {
      const lineMap: { [ln: number]: LineCoverage } = {};
      const branchMapByLine: {
        [ln: number]: { [idx: number]: BranchCoverage };
      } = {};
      for (const lineData of a.concat(b)) {
        const number = lineData.number;
        const comb = (lineMap[number] = lineMap[number] || {
          number,
          hits: 0,
          branches: [],
          branchMap: {},
        });
        if (lineData.hits > 0) {
          comb.hits += lineData.hits;
        }
        const branchMap = (branchMapByLine[number] =
          branchMapByLine[number] || {});
        if (lineData.branches.length) {
          for (const branch of lineData.branches) {
            branchMap[branch.index] = branchMap[branch.index] || {
              index: branch.index,
              hits: 0,
            };
            branchMap[branch.index].hits += branch.hits;
          }
        }
      }
      for (const line of Object.values(lineMap)) {
        const branchMap = branchMapByLine[line.number];
        const indexes = Object.keys(branchMap).map(parseInt);
        for (const index of util.sorted(indexes)) {
          line.branches.push({
            index,
            hits: branchMap[index].hits,
          });
        }
      }
      return Object.values(lineMap);
    }
    for (const common of items.map((u) => u.getCoverageData())) {
      if (common.projectRoot && !combined.projectRoot) {
        combined.projectRoot = common.projectRoot;
      }
      if (common.testSuiteName && !combined.testSuiteName) {
        combined.testSuiteName = common.testSuiteName;
      }
      for (const file of common.files) {
        const existing = fileMap[file.path]?.lines;
        fileMap[file.path] = {
          path: file.path,
          lines: mergeLines(file.lines, existing || []),
        };
      }
    }
    for (const path of util.sorted(Object.keys(fileMap))) {
      combined.files.push({
        path,
        lines: fileMap[path].lines,
      });
    }
    return new Unicov(combined);
  }

  static detectReporter(coverageFile: string): Reporter {
    if (!util.checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}!`);
    }
    const content = util.readFile(coverageFile);
    for (const reporter of REPORTERS) {
      if (reporter.check(content)) {
        return reporter;
      }
    }
    throw new Error(
      `Can't auto detect coverage reporter type for coverage file: ${coverageFile}!`
    );
  }

  toFile(filePath: string, reporterType: CoverageReporterType = "cobertura") {
    const reporter = Unicov.getReporter(reporterType);
    if (!reporter) {
      throw new Error(`Reporter not found for type '${reporterType}'`);
    }
    const defaultFilePath = `${reporterType}.${reporter.extension()}`;
    fs.writeFileSync(
      filePath || defaultFilePath,
      reporter.format(this.coverageData)
    );
  }

  static getReporter(
    reporterType: CoverageReporterType | "auto"
  ): Reporter | null {
    const reporter = REPORTERS.filter((r) => r.type() === reporterType)[0];
    if (!reporter) {
      return null;
    }
    return reporter;
  }

  getCoverageData(): CommonCoverage {
    return this.coverageData;
  }

  setCoverageData(coverageData: CommonCoverage): this {
    this.coverageData = coverageData;
    return this;
  }

  /**
   * Gets coverage of file line. This method will return hits count of file line.
   * Particularly, it will return -1 if given line is a non-executable line.
   * @param filePath
   * @param lineNumber
   */
  getFileLineCoverage(filePath: string, lineNumber: number): number {
    if (!this.coverageData) {
      return 0;
    }
    const fileCoverage = this.coverageData.files.filter(
      (file) => file.path === filePath
    )[0];
    if (!fileCoverage) {
      return 0;
    }
    const lineCoverage = fileCoverage.lines.filter(
      (lc) => lc.number === lineNumber
    )[0];
    if (!lineCoverage) {
      return -1;
    }
    return lineCoverage.hits;
  }

  getOverallLineCoverage(): OverallLineCoverage {
    if (this.coverageData === null) {
      throw new Error(
        `Filed to get overall coverage rate: coverage data is null.`
      );
    }
    let coveredLines = 0;
    let uncoveredLines = 0;
    let coveredBranches = 0;
    let uncoveredBranches = 0;
    for (const fileCoverage of this.coverageData.files) {
      for (const lineCoverage of fileCoverage.lines) {
        if (lineCoverage.hits > 0) {
          coveredLines += 1;
        } else if (lineCoverage.hits === 0) {
          uncoveredLines += 1;
        }
        for (const branchCoverage of lineCoverage.branches) {
          if (branchCoverage.hits > 0) {
            coveredBranches += 1;
          } else if (branchCoverage.hits === 0) {
            uncoveredBranches += 1;
          }
        }
      }
    }
    let lineCoverageRate = 1;
    if (coveredLines + uncoveredLines > 0) {
      lineCoverageRate = (1.0 * coveredLines) / (coveredLines + uncoveredLines);
    }
    let branchCoverageRate = 1;
    if (coveredBranches + uncoveredBranches > 0) {
      branchCoverageRate =
        (1.0 * coveredBranches) / (coveredBranches + uncoveredBranches);
    }
    return {
      coveredLines,
      uncoveredLines,
      lineCoverageRate,
      coveredBranches,
      uncoveredBranches,
      branchCoverageRate,
    };
  }
}
