export interface CoverageData {
  data: Datum[];
  type: string;
  version: string;
}

export interface Datum {
  files: File[];
  functions: Function[];
  totals: Totals;
}

export interface Totals {
  branches: Branches2;
  functions: Functions2;
  instantiations: Instantiations2;
  lines: Lines2;
  regions: Regions2;
}

export interface Function {
  branches: any[];
  count: number;
  filenames: string[];
  name: string;
  regions: number[][];
}

export interface File {
  branches: any[];
  expansions: any[];
  filename: string;
  segments: any[][];
  summary: Summary;
}

export interface Branches {
  count: number;
  covered: number;
  notcovered: number;
  percent: number;
}

export interface Functions {
  count: number;
  covered: number;
  percent: number;
}

export interface Instantiations {
  count: number;
  covered: number;
  percent: number;
}

export interface Lines {
  count: number;
  covered: number;
  percent: number;
}

export interface Regions {
  count: number;
  covered: number;
  notcovered: number;
  percent: number;
}

export interface Summary {
  branches: Branches;
  functions: Functions;
  instantiations: Instantiations;
  lines: Lines;
  regions: Regions;
}

export interface Branches2 {
  count: number;
  covered: number;
  notcovered: number;
  percent: number;
}

export interface Functions2 {
  count: number;
  covered: number;
  percent: number;
}

export interface Instantiations2 {
  count: number;
  covered: number;
  percent: number;
}

export interface Lines2 {
  count: number;
  covered: number;
  percent: number;
}

export interface Regions2 {
  count: number;
  covered: number;
  notcovered: number;
  percent: number;
}
