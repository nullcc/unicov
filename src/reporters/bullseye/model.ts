export interface CoverageData {
  BullseyeCoverage: BullseyeCoverage;
}

export interface BullseyeCoverage {
  $: {
    name: string;
    dir: string;
    buildId: string;
    version: string;
    xmlns: string;
    fn_cov: string;
    fn_total: string;
    cd_cov: string;
    cd_total: string;
    d_cov: string;
    d_total: string;
  };
  folder: Folder[];
}

export interface Folder {
  $: {
    name: string;
    fn_cov: string;
    fn_total: string;
    cd_cov: string;
    cd_total: string;
    d_cov: string;
    d_total: string;
  };
  src: Src[];
}

export interface Src {
  $: {
    name: string;
    mtime: string;
    fn_cov: string;
    fn_total: string;
    cd_cov: string;
    cd_total: string;
    d_cov: string;
    d_total: string;
  };
  fn: Fn[];
}

export interface Fn {
  $: {
    name: string;
    fn_cov: string;
    fn_total: string;
    cd_cov: string;
    cd_total: string;
    d_cov: string;
    d_total: string;
  };
  probe: Probe[];
  block: Block[];
}


export interface Probe {
  $: {
    line: string;
    column: string;
    kind: string;
    event: string;
  };
}

export interface Block {
  $: {
    line: string;
    entered: string;
  };
}
