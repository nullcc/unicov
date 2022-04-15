import {
  CommonCoverage,
  CoverageReporterType,
  FileCoverage,
  Formatter,
  ParseOptions,
  Reporter,
} from "../../common/interface";
import { CoverageData as XccovCoverageData } from "./model";
import * as util from "../../util";
import { create } from "xmlbuilder2";

export class XccovReporter implements Reporter {
  async parse(
    content: string,
    options: ParseOptions = {}
  ): Promise<CommonCoverage> {
    if (!this.check(content)) {
      throw new Error(`Invalid xccov coverage reporter`);
    }
    const data: XccovCoverageData = await util.xml2json(content);
    const caseInsensitive = !!options.caseInsensitive;
    const commonCoverage: CommonCoverage = {
      files: [],
    };
    if (!data.coverage.file) {
      return commonCoverage;
    }
    for (const file of data.coverage.file) {
      const filePath = util.getFilePath(file.$.path, caseInsensitive);
      const fileCoverage: FileCoverage = {
        path: filePath,
        lines: [],
      };
      commonCoverage.files.push(fileCoverage);
      if (!file.lineToCover) {
        continue;
      }
      for (const line of file.lineToCover) {
        const number = parseInt(line.$.lineNumber);
        const hits = line.$.covered === "true" ? 1 : 0;
        fileCoverage.lines.push({
          number,
          hits,
          branches: [],
        });
      }
    }
    return commonCoverage;
  }

  format(data: CommonCoverage): string {
    const root = create({ version: "1.0" });
    const coverage = root.ele("coverage", { version: "1" });
    data.files.forEach((fileCoverage) => {
      const file = coverage.ele("file", { path: fileCoverage.path });
      fileCoverage.lines.forEach((lineCoverage) => {
        file.ele("lineToCover", {
          lineNumber: lineCoverage.number,
          covered: lineCoverage.hits > 0 ? "true" : "false",
        });
      });
    });
    return root.end({ prettyPrint: true });
  }

  check(content: string): boolean {
    return content.indexOf("<lineToCover") !== -1;
  }

  type(): CoverageReporterType {
    return "xccov";
  }

  extension(): string {
    return "xml";
  }
}
