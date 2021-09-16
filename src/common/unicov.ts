import * as _ from 'lodash';
import { CoverageReporterType, CommonCoverageMapData } from './interface';
import { JsonFileCoverage } from '../reporters/json/coverage';
import { CoberturaFileCoverage } from '../reporters/cobertura/coverage';
import { JacocoFileCoverage } from '../reporters/jacoco/coverage';
import { checkFileExistence } from '../util';

export class Unicov {
  private coverageData: CommonCoverageMapData | null = null;

  private constructor() {

  }

  getCoverageData(): CommonCoverageMapData | null {
    return this.coverageData;
  }

  setCoverageData(coverageData: CommonCoverageMapData) {
    this.coverageData = coverageData;
  }

  /**
   * Get Unicov instance by coverage files and coverage reporter type.
   * @param coverageFiles
   * @param reporterType
   */
  static async fromCoverages(coverageFiles: string[], reporterType: CoverageReporterType): Promise<Unicov> {
    const coverages = await Promise.all(coverageFiles.map(async file => Unicov.fromCoverage(file, reporterType)));
    return Unicov.merge(coverages);
  }

  /**
   * Get Unicov instance by coverage file and coverage reporter type.
   * @param coverageFile
   * @param reporterType
   */
  static async fromCoverage(coverageFile: string, reporterType: CoverageReporterType): Promise<Unicov> {
    if (!checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}!`);
    }
    switch (reporterType) {
      case 'json': {
        const unicov = new Unicov();
        const jsonFileCoverage = new JsonFileCoverage();
        const coverageData = await jsonFileCoverage.into(coverageFile);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'cobertura': {
        const unicov = new Unicov();
        const coberturaFileCoverage = new CoberturaFileCoverage();
        const coverageData = await coberturaFileCoverage.into(coverageFile);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'jacoco': {
        const unicov = new Unicov();
        const jacocoFileCoverage = new JacocoFileCoverage();
        const coverageData = await jacocoFileCoverage.into(coverageFile);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      default:
        throw new Error(`Unknown coverage reporter '${reporterType}'`);
    }
  }

  /**
   * Merges multi unicovs
   * @param items
   */
  static merge(items: Unicov[]): Unicov {
    const coverageData = _.chain(items)
      .map(item => item.getCoverageData())
      .reduce((acc, curr) => {
        acc = _.merge(acc, curr);
        return acc;
      }, {})
      .value();
    const unicov = new Unicov();
    unicov.setCoverageData(coverageData);
    return unicov;
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
    const fileCoverage = this.coverageData[filePath];
    if (!fileCoverage) {
      return 0;
    }
    const lineMap = fileCoverage.lineMap;
    const line = lineMap[lineNumber];
    return line ? line.hits : -1;
  }
}
