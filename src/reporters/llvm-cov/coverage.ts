import * as _ from 'lodash';
import {
  FileCoverageOptions,
  CommonCoverageMapData,
  CoverageReporterType,
  FileCoverage,
} from '../../common/interface';
import * as util from '../../util';
import { CoverageData as LLVMCovCoverageData } from './model';

export class LLVMCovFileCoverage implements FileCoverage {
  async into(coverageFile: string, options: FileCoverageOptions = {}): Promise<CommonCoverageMapData> {
    const content = util.readFile(coverageFile);
    if (!this.check(content)) {
      throw new Error(`Invalid llvm-cov coverage reporter: ${coverageFile}`);
    }
    const data: LLVMCovCoverageData = await JSON.parse(content);
    const caseInsensitive = !!options.caseInsensitive;
    const commonCoverage = {};
    for (const tmp of data.data) {
      for (const file of tmp.files) {
        const filePath = util.getFilePath(file.filename, caseInsensitive);
        commonCoverage[filePath] = {
          path: filePath,
          lineMap: {},
        };
        const segments = file.segments;
        const segmentLength = segments.length;
        segments.forEach((segment, index) => {
          // https://github.com/llvm/llvm-project/blob/main/llvm/tools/llvm-cov/CoverageExporterJson.cpp#L80
          // json::Array renderSegment(const coverage::CoverageSegment &Segment) {
          //   return json::Array({Segment.Line, Segment.Col,
          //     clamp_uint64_to_int64(Segment.Count), Segment.HasCount,
          //     Segment.IsRegionEntry, Segment.IsGapRegion});
          // }
          const [line, column, hits, hasCount, isRegionEntry, isGapRegion] = segment;
          if (!hasCount) {
            return;
          }
          if (index < segmentLength - 1) {
            const nextSegment = segments[index + 1];
            const nextSegmentStartLine = nextSegment[0];
            _.range(line, nextSegmentStartLine + 1).forEach(line => {
              commonCoverage[filePath].lineMap[line] = {
                number: line,
                hits,
              };
            });
          } else {
            commonCoverage[filePath].lineMap[line] = {
              number: line,
              hits,
            };
          }
        });
      }
    }
    return commonCoverage;
  }

  check(content: string): boolean {
    return content.indexOf('llvm.coverage.json.export') !== -1;
  }

  getType(): CoverageReporterType {
    return 'llvm-cov';
  }
}
