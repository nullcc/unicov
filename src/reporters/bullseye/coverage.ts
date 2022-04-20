import path from 'path';
import {
  FileCoverageOptions,
  CommonCoverageMapData,
  CoverageReporterType,
  FileCoverage,
} from '../../common/interface';
import { CoverageData as BullseyeCoverageData } from './model';
import * as util from '../../util';

export class BullseyeFileCoverage implements FileCoverage {
  async into(coverageFile: string, options: FileCoverageOptions = {}): Promise<CommonCoverageMapData> {
    const content = util.readFile(coverageFile);
    if (!this.check(content)) {
      throw new Error(`Invalid bullseye coverage reporter: ${coverageFile}`);
    }
    const data: BullseyeCoverageData = await util.xml2json(content);
    const caseInsensitive = !!options.caseInsensitive;
    const commonCoverage = {};
    const projectRoot = data.BullseyeCoverage.$.dir;
    const folders = data.BullseyeCoverage.folder;
    for (const folder of folders) {
      for (const file of folder.src) {
        const filePath = util.getFilePath(path.join(projectRoot, file.$.name), caseInsensitive);
        commonCoverage[filePath] = {
          path: filePath,
          lineMap: {},
        };
      }
    }
    return commonCoverage;
  }

  check(content: string): boolean {
    return content.indexOf('BullseyeCoverage') !== -1;
  }

  getType(): CoverageReporterType {
    return 'bullseye';
  }
}
