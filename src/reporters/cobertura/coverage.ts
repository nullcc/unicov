import path from 'path';
import {
  FileCoverageOptions,
  CommonCoverageMapData,
  CoverageReporterType,
  FileCoverage,
} from '../../common/interface';
import { CoverageData as CoberturaCoverageData } from './model';
import * as util from '../../util';

export class CoberturaFileCoverage implements FileCoverage {
  async into(coverageFile: string, options: FileCoverageOptions = {}): Promise<CommonCoverageMapData> {
    const content = util.readFile(coverageFile);
    if (!this.check(content)) {
      throw new Error(`Invalid cobertura coverage reporter: ${coverageFile}`);
    }
    const data: CoberturaCoverageData = await util.xml2json(content);
    const caseInsensitive = !!options.caseInsensitive;
    const projectRoot = data.coverage.sources[0].source[0];
    const packages = data.coverage.packages;
    const commonCoverage = {};
    for (const pkg_ of packages) {
      if (typeof pkg_ !== 'object') {
        continue;
      }
      for (const pkg of pkg_.package) {
        for (const cls_ of pkg.classes) {
          for (const cls of cls_.class) {
            const filePath = util.getFilePath(path.join(projectRoot, cls.$.filename), caseInsensitive);
            commonCoverage[filePath] = {
              path: filePath,
              lineMap: {},
            };
            cls.lines.forEach(line => {
              if (!line.line) {
                return;
              }
              line.line.forEach(line => {
                const lineNumber = parseInt(line.$.number);
                const hits = parseInt(line.$.hits);
                commonCoverage[filePath].lineMap[lineNumber] = {
                  number: lineNumber,
                  hits,
                };
              });
            });
          }
        }
      }
    }
    return commonCoverage;
  }

  check(content: string): boolean {
    return content.indexOf('cobertura') !== -1;
  }

  getType(): CoverageReporterType {
    return 'cobertura';
  }
}
