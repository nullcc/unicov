export interface CoverageData {
  coverage: {
    $: {
      version: string;
    };
    file: {
      $: {
        path: string;
      };
      lineToCover: {
        $: {
          lineNumber: string;
          covered: string;
        };
      }[];
    }[];
  };
}
