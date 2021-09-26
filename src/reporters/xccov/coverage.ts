import fs from 'fs';
import { CommonCoverageMapData, FileCoverage } from '../../common/interface';
import { CoverageData as XccovCoverageData } from './model';
import { xml2json } from '../../util';

export class XccovFileCoverage implements FileCoverage {
  async into(coverageFile: string): Promise<CommonCoverageMapData> {
    const content = fs.readFileSync(coverageFile).toString();
    if (!this._isXccovCoverageReporter(content)) {
      throw new Error(`Invalid xccov coverage reporter: ${coverageFile}`);
    }
    const data: XccovCoverageData = await xml2json(content);
    const commonCoverage = {};
    for (const file of data.coverage.file) {
      const filePath = file.$.path;
      commonCoverage[filePath] = {
        path: filePath,
        lineMap: {},
      };
      for (const line of file.lineToCover) {
        const lineNumber = parseInt(line.$.lineNumber);
        const hits = line.$.covered === 'true' ? 1 : 0;
        commonCoverage[filePath].lineMap[lineNumber] = {
          lineNumber,
          hits,
        };
      }
    }
    return commonCoverage
  }

  private _isXccovCoverageReporter(content: string): boolean {
    return content.indexOf('lineToCover') !== -1;
  }
}