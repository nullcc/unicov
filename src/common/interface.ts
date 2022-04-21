export interface FileCoverageOptions {
  caseInsensitive?: boolean;
}

export type CoverageReporterType = 'json' | 'cobertura' | 'jacoco' | 'xccov' | 'clover';

export interface CommonCoverageMapData {
  [key: string]: CommonCoverageData;
}

export interface CommonCoverageData {
  path: string;
  lineMap: Map<string, Line>;
}

interface Line {
  number: number;
  hits: number;
}

export interface FileCoverage {
  into(coverageFile: string, options: FileCoverageOptions): Promise<CommonCoverageMapData>;
  check(content: string): boolean;
  getType(): CoverageReporterType;
}

export interface OverallLineCoverage {
  coveredLines: number;
  uncoveredLines: number;
  overallLineCoverageRate: number;
}
