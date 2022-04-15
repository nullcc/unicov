#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CoverageReporterType } from "./common/interface";

import { Unicov } from "./index";

(async function main() {
  const args = yargs(hideBin(process.argv))
    .option("output", {
      alias: "o",
      type: "string",
      required: true,
      default: "lcov:lcov.info",
      description: "Write output to (format):(path)",
    })
    .parse();
  const unicov = await Unicov.fromCoverages(args._.map(String));
  const outputParts = args.output.split(":");
  const reporterType = (outputParts[0] as CoverageReporterType) || "cobertura";
  unicov.toFile(outputParts[1], reporterType);
})();
