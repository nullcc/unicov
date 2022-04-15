import path from "path";
import {
  CommonCoverage,
  CoverageReporterType,
  FileCoverage,
  LineCoverage,
  ParseOptions,
  Reporter,
} from "../../common/interface";

/**
Relevant spec from http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php

Following is a quick description of the tracefile  format  as  used  by
genhtml, geninfo and lcov.

A tracefile is made up of several human-readable lines of text, divided
into sections. If available, a tracefile begins with the testname which
is stored in the following format:

  TN:<test name>

For  each  source  file  referenced in the .da file, there is a section
containing filename and coverage data:

  SF:<absolute path to the source file>

Following is a list of line numbers for each function name found in the
source file:

  FN:<line number of function start>,<function name>

Next,  there  is a list of execution counts for each instrumented func‐
tion:

  FNDA:<execution count>,<function name>

This list is followed by two lines containing the number  of  functions
found and hit:

  FNF:<number of functions found>
  FNH:<number of function hit>

Branch coverage information is stored which one line per branch:

  BRDA:<line number>,<block number>,<branch number>,<taken>

Block  number  and  branch  number are gcc internal IDs for the branch.
Taken is either '-' if the basic block containing the branch was  never
executed or a number indicating how often that branch was taken.

Branch coverage summaries are stored in two lines:

  BRF:<number of branches found>
  BRH:<number of branches hit>

Then  there  is  a  list of execution counts for each instrumented line
(i.e. a line which resulted in executable code):

  DA:<line number>,<execution count>[,<checksum>]

Note that there may be an optional checksum present  for  each  instru‐
mented  line.  The  current  geninfo implementation uses an MD5 hash as
checksumming algorithm.

At the end of a section, there is a summary about how many  lines  were
found and how many were actually instrumented:

  LH:<number of lines with a non-zero execution count>
  LF:<number of instrumented lines>

Each sections ends with:

  end_of_record
**/

/**
 * Coverage Reporter for LCOV
 */
export class LcovReporter implements Reporter {
  parse(content: string, options: ParseOptions): Promise<CommonCoverage> {
    const common = {
      files: [] as FileCoverage[],
      testSuiteName: "",
      projectRoot: "",
    };
    let longestCommonRoot = "";
    let fileCoverage: FileCoverage | null = null;
    let lineCoverage: { [k: number]: LineCoverage } = {};
    for (const line of content.split("\n")) {
      if (line.startsWith("TN:")) {
        common.testSuiteName = line.split("TN:")[1];
      } else if (line.startsWith("SF:")) {
        const path = line.split("SF:")[1];
        if (!longestCommonRoot) {
          longestCommonRoot = path;
        } else {
          longestCommonRoot = longestMatchingSubstring(path, longestCommonRoot);
        }
        fileCoverage = {
          path,
          lines: [],
        };
        lineCoverage = {};
        common.files.push(fileCoverage);
      } else if (line.startsWith("DA:")) {
        const [number, hits] = line
          .split("DA:")[1]
          .split(",")
          .map((v) => parseInt(v, 10));
        lineCoverage[number] = lineCoverage[number] || {
          number,
          hits: 0,
          branches: [],
        };
        lineCoverage[number].hits = hits;
      } else if (line.startsWith("BRDA:")) {
        function tryInt(v: string): string | number {
          const iv = parseInt(v, 10);
          if (isNaN(iv)) {
            return v;
          }
          return iv;
        }
        const [number, _block, branchNumber, taken] = line
          .split("BRDA:")[1]
          .split(",")
          .map(tryInt);
        lineCoverage[number] = lineCoverage[number] || {
          number,
          hits: 0,
          branches: [],
        };
        lineCoverage[number].branches.push({
          index: branchNumber,
          hits: taken != "-" && taken > 0 ? taken : 0,
        });
      } else if (line.startsWith("end_of_record")) {
        if (fileCoverage) {
          const lineNumbers = Object.keys(lineCoverage);
          lineNumbers.sort();
          fileCoverage.lines = lineNumbers.map(
            (number) => lineCoverage[number]
          );
          fileCoverage = null;
        }
      }
    }
    common.projectRoot = path.dirname(longestCommonRoot).replace(/\/$/, "");
    common.files.forEach((file) => {
      file.path = file.path.replace(common.projectRoot, "").replace(/^\//, "");
    });
    return Promise.resolve(common);
  }

  format(data: CommonCoverage): string {
    const output = [];
    if (data.testSuiteName) {
      output.push(`TN:${data.testSuiteName}`);
    }
    data.files.forEach((file) => {
      const absPath = data.projectRoot
        ? `${data.projectRoot}/${file.path}`
        : file.path;
      output.push(`SF:${absPath}`);
      file.lines.forEach((line) => {
        output.push(`DA:${line.number},${line.hits}`);
      });
      file.lines.forEach((line) => {
        line.branches.forEach((branch) => {
          output.push(`BRDA:${line.number},0,${branch.index},${branch.hits}`);
        });
      });
      output.push("end_of_record");
    });
    return output.join("\n") + "\n";
  }

  check(content: string): boolean {
    return content.startsWith("SF:") || content.startsWith("TN:");
  }

  type(): CoverageReporterType {
    return "lcov";
  }

  extension(): string {
    return "info";
  }
}

function longestMatchingSubstring(m1: string, m2: string) {
  let i = 0;
  let maxLen = Math.min(m1.length, m2.length);
  while (i < maxLen && m1.charAt(i) === m2.charAt(i)) {
    i++;
  }
  return m1.substring(0, i);
}
