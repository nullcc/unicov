import {
  FileCoverageOptions,
  CommonCoverageMapData,
  CoverageReporterType,
  FileCoverage,
} from '../../common/interface';
import { CoverageData as CloverCoverageData } from './model';
import * as util from '../../util';

export class CloverFileCoverage implements FileCoverage {
  async into(coverageFile: string, options: FileCoverageOptions = {}): Promise<CommonCoverageMapData> {
    const content = util.readFile(coverageFile);
    if (!this.check(content)) {
      throw new Error(`Invalid clover coverage reporter: ${coverageFile}`);
    }
    const data: CloverCoverageData = await util.xml2json(content);
    const caseInsensitive = !!options.caseInsensitive;
    const commonCoverage = {};
    for (const project of data.coverage.project) {
      for (const pkg of project.package) {
        for (const file of pkg.file) {
          const filePath = util.getFilePath(file.$.path, caseInsensitive);
          commonCoverage[filePath] = {
            path: filePath,
            lineMap: {},
          };
          if (!file.line) {
            continue;
          }
          file.line.forEach(line => {
            const lineNumber = parseInt(line.$.num);
            const hits = parseInt(line.$.count);
            commonCoverage[filePath].lineMap[lineNumber] = {
              number: lineNumber,
              hits,
            };
          })
        }
      }
    }
    return commonCoverage;
  }

  check(content: string): boolean {
    return content.indexOf('clover') !== -1;
  }

  getType(): CoverageReporterType {
    return 'clover';
  }
}
