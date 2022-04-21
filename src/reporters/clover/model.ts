export interface CoverageData {
  coverage: {
    $: {
      generated: string;
      clover: string;
    };
    project: {
      $: {
        timestamp: string;
        name: string;
      };
      metrics: {
        $: {
          statements: string;
          coveredstatements: string;
          conditionals: string;
          coveredconditionals: string;
          methods: string;
          coveredmethods: string;
          elements: string;
          coveredelements: string;
          complexity: string;
          loc: string;
          ncloc: string;
          packages: string;
          files: string;
          classes: string;
        };
      }[];
      package: {
        $: {
          name: string;
        };
        metrics: {
          $: {
            statements: string;
            coveredstatements: string;
            conditionals: string;
            coveredconditionals: string;
            methods: string;
            coveredmethods: string;
          };
        }[];
        file: {
          $: {
            name: string;
            path: string;
          };
          metrics: {
            $: {
              statements: string;
              coveredstatements: string;
              conditionals: string;
              coveredconditionals: string;
              methods: string;
              coveredmethods: string;
            };
          }[];
          line: {
            $: {
              num: string;
              count: string;
              type: string;
              truecount: string;
              falsecount: string;
            };
          }[];
        }[];
      }[];
    }[];
  };
}
