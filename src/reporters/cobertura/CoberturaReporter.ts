import path from "path";
import {
  CommonCoverage,
  CoverageReporterType,
  FileCoverage,
  Formatter,
  LineCoverage,
  ParseOptions,
  Reporter,
} from "../../common/interface";
import { CoberturaCoverageData as CoberturaCoverageData } from "./model";
import * as util from "../../util";
import { create } from "xmlbuilder2";

export class CoberturaReporter implements Reporter {
  async parse(
    content: string,
    options: ParseOptions = {}
  ): Promise<CommonCoverage> {
    const data: CoberturaCoverageData = await util.xml2json(content);
    if (!data.coverage || !data.coverage.packages) {
      throw new Error("Invalid cobertura coverage reporter");
    }
    const caseInsensitive = !!options.caseInsensitive;
    const projectRoot = data.coverage.sources[0].source[0];
    const packages = data.coverage.packages;
    const commonCoverage: CommonCoverage = {
      projectRoot,
      files: [],
    };
    for (const pkg_ of packages) {
      for (const pkg of pkg_.package) {
        for (const cls_ of pkg.classes) {
          for (const cls of cls_.class) {
            const filePath = util.getFilePath(
              path.join(projectRoot, cls.$.filename),
              caseInsensitive
            );
            const fileCoverage: FileCoverage = {
              path: filePath,
              lines: [],
            };
            commonCoverage.files.push(fileCoverage);
            cls.lines.forEach((line) => {
              line.line.forEach((line) => {
                const number = parseInt(line.$.number);
                const hits = parseInt(line.$.hits);
                const lineCoverage: LineCoverage = {
                  number,
                  hits,
                  branches: [],
                };
                const cc = line.$["condition-coverage"];
                if (cc) {
                  const match = cc.match(/\(([0-9]+)\/([0-9]+)\)/);
                  if (match) {
                    const coveredBranches = parseInt(match[1], 10);
                    const totalBranches = parseInt(match[2], 10);
                    for (let index = 0; index < totalBranches; index++) {
                      const hits = index < coveredBranches ? 1 : 0;
                      lineCoverage.branches.push({
                        index,
                        hits,
                      });
                    }
                  }
                }
                fileCoverage.lines.push(lineCoverage);
              });
            });
          }
        }
      }
    }
    return commonCoverage;
  }

  format(data: CommonCoverage): string {
    const root = create({ version: "1.0" });
    const coverage = root.ele("coverage");
    if (data.projectRoot) {
      coverage.ele("sources").ele("source").txt(data.projectRoot);
    }
    const files = data.files;
    const classes = coverage.ele("packages").ele("package").ele("classes");
    files.forEach((file) => {
      const filename = data.projectRoot
        ? path.relative(file.path, data.projectRoot)
        : file.path;
      const cls = classes.ele("class", {
        filename,
      });
      const lines = cls.ele("lines");
      file.lines.forEach((lineData) => {
        const lineAttrs: { [k: string]: string } = {
          number: String(lineData.number),
          hits: String(lineData.hits),
        };
        const totalBranches = lineData.branches.length;
        if (totalBranches > 0) {
          const coveredBranches = lineData.branches.filter(
            (b) => b.hits > 0
          ).length;
          lineAttrs.branch = "true";
          const perc = Math.floor((100.0 * coveredBranches) / totalBranches);
          const cc = `${perc}% (${coveredBranches}/${totalBranches})`;
          lineAttrs["condition-coverage"] = cc;
        }
        lines.ele("line", lineAttrs);
      });
    });
    return root.end({ prettyPrint: true });
  }

  check(content: string): boolean {
    return content.indexOf("cobertura") !== -1;
  }

  type(): CoverageReporterType {
    return "cobertura";
  }

  extension(): string {
    return "xml";
  }
}
