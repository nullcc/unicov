import fs from 'fs';
import * as _ from 'lodash';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { SourceMapConsumer } from 'source-map';
import { CommonCoverageMapData, FileCoverage } from '../../common/interface';
import { CoverageMapData as JsonCoverageMapData } from "./model";
import { checkFileExistence } from '../../util';
const transformer = require('istanbul-lib-source-maps/lib/transformer');

export class JsonFileCoverage implements FileCoverage {
  async into(coverageFile: string): Promise<CommonCoverageMapData> {
    if (!checkFileExistence(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}`);
    }
    const content = fs.readFileSync(coverageFile).toString();
    if (!this._isJsonCoverageReporter(content)) {
      throw new Error(`Invalid json coverage reporter: ${coverageFile}`);
    }
    const data = await this.getSourceCodeCoverage(JSON.parse(content));
    const commonCoverage = {};
    for (const key in data) {
      const filePath = data[key].path;
      const statementMap = data[key].statementMap;
      const s = data[key].s;
      commonCoverage[filePath] = {
        path: filePath,
        lineMap: {},
      };
      for (const statementKey in statementMap) {
        const range = statementMap[statementKey];
        const startLine = range.start.column ? range.start.line : range.start.line + 1;
        const endLine = range.end.column ? range.end.line : range.end.line - 1;
        const hits = s[statementKey];
        _.range(startLine, endLine + 1).forEach(lineNumber => {
          commonCoverage[filePath].lineMap[lineNumber] = {
            number: lineNumber,
            hits,
          };
        });
      }
    }
    return commonCoverage;
  }

  private _isJsonCoverageReporter(content: string): boolean {
    return content.indexOf('statementMap') !== -1;
  }

  private getRandomProperty(coverageMapData: JsonCoverageMapData) {
    const keys = Object.keys(coverageMapData);
    return coverageMapData[keys[(keys.length * Math.random()) << 0]];
  }

  private async getSourceCodeCoverage(coverageMapData: JsonCoverageMapData): Promise<JsonCoverageMapData> {
    const data = {};
    const randomFileCov = this.getRandomProperty(coverageMapData);
    if (!randomFileCov.inputSourceMap) { // already source code coverage data, just return
      return coverageMapData;
    }
    for (const key in coverageMapData) {
      const fileCov = coverageMapData[key];
      const coverageMap = createCoverageMap({});
      coverageMap.addFileCoverage(fileCov);
      const finder = await new SourceMapConsumer(fileCov.inputSourceMap);
      const mapped = transformer.create(() => finder).transform(coverageMap);
      Object.assign(data, mapped.data);
    }
    return data;
  };
}