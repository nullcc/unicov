export interface CoberturaCoverageData {
  coverage: {
    $: {
      "line-rate": string;
      "branch-rate": string;
      "lines-covered": string;
      "lines-valid": string;
      "branches-covered": string;
      "branches-valid": string;
      complexity: string;
      timestamp: string;
      version: string;
    };
    sources: Source[];
    packages: Package[];
  };
}

interface Source {
  source: string[];
}

interface Package {
  package: {
    $: {
      name: string;
      "line-rate": string;
      "branch-rate": string;
      complexity: string;
    };
    classes: Class[];
  }[];
}

interface Class {
  class: {
    $: {
      name: string;
      filename: string;
      "line-rate": string;
      "branch-rate": string;
      complexity: string;
    };
    methods: string[];
    lines: Line[];
  }[];
}

interface Line {
  line: {
    $: {
      number: string;
      hits: string;
      branch: string;
      "condition-coverage"?: string;
    };
    conditions?: Condition[];
  }[];
}

interface Condition {
  condition: {
    $: {
      number: string;
      type: string;
      coverage: string;
    };
  }[];
}
