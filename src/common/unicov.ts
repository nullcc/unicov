import * as _ from 'lodash';
import {
  FileCoverageOptions,
  CoverageReporterType,
  CommonCoverageMapData,
  OverallLineCoverage,
} from './interface';
import { JsonFileCoverage } from '../reporters/json/coverage';
import { CoberturaFileCoverage } from '../reporters/cobertura/coverage';
import { JacocoFileCoverage } from '../reporters/jacoco/coverage';
import { XccovFileCoverage } from '../reporters/xccov/coverage';
import { BullseyeFileCoverage } from '../reporters/bullseye/coverage';
import * as util from '../util';

export class Unicov {
  private coverageData: CommonCoverageMapData | null = null;

  private constructor() {

  }

  /**
   * Get Unicov instance by coverage files and coverage reporter type.
   * @param coverageFiles
   * @param reporterType
   */
  static async fromCoverages(coverageFiles: string[], reporterType: CoverageReporterType | 'auto', options: FileCoverageOptions = {}): Promise<Unicov> {
    const coverages = await Promise.all(coverageFiles.map(async file => Unicov.fromCoverage(file, reporterType, options)));
    return Unicov.merge(coverages);
  }

  /**
   * Get Unicov instance by coverage file and coverage reporter type.
   * @param coverageFile
   * @param reporterType
   */
  static async fromCoverage(coverageFile: string, reporterType: CoverageReporterType | 'auto', options: FileCoverageOptions = {}): Promise<Unicov> {
    if (!util.checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}!`);
    }
    let type = reporterType;
    if (type === 'auto') {
      type = Unicov.getCoverageReporterType(coverageFile);
    }
    switch (type) {
      case 'json': {
        const unicov = new Unicov();
        const jsonFileCoverage = new JsonFileCoverage();
        const coverageData = await jsonFileCoverage.into(coverageFile, options);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'cobertura': {
        const unicov = new Unicov();
        const coberturaFileCoverage = new CoberturaFileCoverage();
        const coverageData = await coberturaFileCoverage.into(coverageFile, options);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'jacoco': {
        const unicov = new Unicov();
        const jacocoFileCoverage = new JacocoFileCoverage();
        const coverageData = await jacocoFileCoverage.into(coverageFile, options);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'xccov': {
        const unicov = new Unicov();
        const xccovFileCoverage = new XccovFileCoverage();
        const coverageData = await xccovFileCoverage.into(coverageFile, options);
        unicov.setCoverageData(coverageData);
        return unicov;
      }
      case 'bullseye': {
        const unicov = new Unicov();
        const bullseyeFileCoverage = new BullseyeFileCoverage();
        const coverageData = await bullseyeFileCoverage.into(coverageFile, options);
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

  static getCoverageReporterType(coverageFile: string): CoverageReporterType {
    if (!util.checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}!`);
    }
    const content = util.readFile(coverageFile);
    const coverageReporterClasses = [
      JsonFileCoverage,
      CoberturaFileCoverage,
      JacocoFileCoverage,
      XccovFileCoverage,
    ];
    for (const coverageReporterClass of coverageReporterClasses) {
      const coverageReporter = new coverageReporterClass();
      if (coverageReporter.check(content)) {
        return coverageReporter.getType();
      }
    }
    throw new Error(`Can't auto detect coverage reporter type for coverage file: ${coverageFile}!`);
  }

  getCoverageData(): CommonCoverageMapData | null {
    return this.coverageData;
  }

  setCoverageData(coverageData: CommonCoverageMapData) {
    this.coverageData = coverageData;
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

  getOverallLineCoverage(): OverallLineCoverage {
    if (this.coverageData === null) {
      throw new Error(`Filed to get overall coverage rate: coverage data is null.`);
    }
    let coveredLines = 0;
    let uncoveredLines = 0;
    for (const fileName in this.coverageData) {
      const fileCoverageData = this.coverageData[fileName];
      for (const lineNumber in fileCoverageData.lineMap) {
        const lineCoverageData = fileCoverageData.lineMap[lineNumber];
        if (lineCoverageData.hits > 0) {
          coveredLines += 1;
        } else if (lineCoverageData.hits === 0) {
          uncoveredLines += 1;
        }
      }
    }
    let overallLineCoverageRate = 1;
    if (coveredLines + uncoveredLines > 0) {
      overallLineCoverageRate = parseFloat((coveredLines / (coveredLines + uncoveredLines)).toFixed(4));
    }
    return {
      coveredLines,
      uncoveredLines,
      overallLineCoverageRate,
    };
  }
}
