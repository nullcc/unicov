// See https://stackoverflow.com/questions/33868761/how-to-interpret-the-jacoco-xml-file

export interface SessionInfo {
  $: {
    id: string;
    start: string;
    dump: string;
  };
}

export interface Counter {
  $: {
    type: string;
    missed: string;
    covered: string;
  };
}

export interface Method {
  $: {
    name: string;
    desc: string;
    line: string;
  };
  counter: Counter[];
}

export interface Class {
  $: {
    name: string;
  };
  method: Method[];
  counter: Counter[];
}

export interface Line {
  $: {
    nr: string;
    mi: string;
    ci: string;
    mb: string;
    cb: string;
  };
}

export interface SourceFile {
  $: {
    name: string;
  };
  line: Line[];
  counter: Counter[];
}

export interface Package {
  $: {
    name: string;
  };
  class: Class[];
  sourcefile: SourceFile[];
  counter: Counter[];
}

export interface Report {
  $: {
    name: string;
  };
  sessioninfo: SessionInfo[];
  package: Package[];
  counter: Counter[];
}

export interface CoverageData {
  report: Report;
}
