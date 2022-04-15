import path from "path";
import {
  ParseOptions,
  CommonCoverage,
  CoverageReporterType,
  Reporter,
  BranchCoverage,
  FileCoverage,
  Formatter,
} from "../../common/interface";
import { CoverageData as JacocoCoverageData } from "./model";
import * as util from "../../util";
import { create } from "xmlbuilder2";

export class JacocoReporter implements Reporter {
  async parse(
    content: string,
    options: ParseOptions = {}
  ): Promise<CommonCoverage> {
    if (!this.check(content)) {
      throw new Error(`Invalid jacoco coverage reporter`);
    }
    const data: JacocoCoverageData = await util.xml2json(content);
    const caseInsensitive = !!options.caseInsensitive;
    const commonCoverage: CommonCoverage = {
      files: [],
    };
    for (const pkg of data.report.package) {
      const pkgDir = pkg.$.name;
      commonCoverage.projectRoot = pkgDir;
      for (const sourceFile of pkg.sourcefile) {
        const filePath = util.getFilePath(
          path.join(pkgDir, sourceFile.$.name),
          caseInsensitive
        );
        commonCoverage[filePath] = {
          path: filePath,
          lineMap: {},
        };
        if (!sourceFile.line) {
          continue;
        }
        for (const line of sourceFile.line) {
          const lineNumber = parseInt(line.$.nr, 10);
          const coveredInstructions = parseInt(line.$.ci, 10);
          const missedBranches = parseInt(line.$.mb, 10);
          const coveredBranches = parseInt(line.$.cb, 10);
          const isBranch = missedBranches > 0 || coveredBranches > 0;
          let hits = 0;
          if (isBranch) {
            hits = coveredBranches > 0 ? 1 : 0;
          } else {
            hits = coveredInstructions > 0 ? 1 : 0;
          }
          const branches: BranchCoverage[] = [];
          for (
            let index = 0;
            index < missedBranches + coveredBranches;
            index++
          ) {
            const hits = index < coveredBranches ? 1 : 0;
            branches.push({
              index,
              hits,
            });
          }
          commonCoverage[filePath].lineMap[lineNumber] = {
            lineNumber,
            hits,
            branches,
          };
        }
      }
    }
    return commonCoverage;
  }

  format(data: CommonCoverage): string {
    const root = create({ version: "1.0" });
    const packageMap: { [p: string]: FileCoverage[] } = {};
    const reportName = data.testSuiteName || "test";
    const report = root.ele("report", { name: reportName });
    for (const file of data.files) {
      const pkg = path.dirname(file.path);
      packageMap[pkg] = packageMap[pkg] || [];
      packageMap[pkg].push(file);
    }
    for (const pkg of util.sorted(Object.keys(packageMap))) {
      const pkgEle = report.ele("package", { name: pkg });
      for (const fileCoverage of packageMap[pkg]) {
        const sf = pkgEle.ele("sourcefile", {
          name: path.basename(fileCoverage.path),
        });
        let sourceMissedBranches = 0;
        let sourceCoveredBranches = 0;
        let missedLines = 0;
        let coveredLines = 0;
        for (const lineCoverage of fileCoverage.lines) {
          const missedBranches = lineCoverage.branches.filter(
            (br) => br.hits === 0
          ).length;
          const coveredBranches = lineCoverage.branches.filter(
            (br) => br.hits > 0
          ).length;
          sourceMissedBranches += missedBranches;
          sourceCoveredBranches += coveredBranches;
          if (lineCoverage.hits > 0) {
            coveredLines += 1;
          } else {
            missedLines += 1;
          }
          const line = sf.ele("line", {
            nr: lineCoverage.number,
            mi: lineCoverage.hits > 0 ? 0 : 1,
            ci: lineCoverage.hits === 0 ? 0 : 1,
            mb: missedBranches,
            cb: coveredBranches,
          });
        }
        sf.ele("counter", {
          type: "LINE",
          missed: missedLines,
          covered: coveredLines,
        });
        sf.ele("counter", {
          type: "BRANCH",
          missed: sourceMissedBranches,
          covered: sourceCoveredBranches,
        });
      }
    }
    return root.end({ prettyPrint: true });
  }

  check(content: string): boolean {
    return (
      content.indexOf("<package") !== -1 &&
      content.indexOf("<line") !== -1 &&
      content.indexOf("<sourcefile") !== -1
    );
  }

  type(): CoverageReporterType {
    return "jacoco";
  }

  extension(): string {
    return "xml";
  }
}
