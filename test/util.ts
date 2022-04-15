import fs from "fs";
import path from "path";
import rimraf from "rimraf";

import { CoverageReporterType, Unicov } from "../src";

export function checkSnapshot(unicov: Unicov, name: string) {
  const snapshot = name.includes("/") ? name : `./test/fixtures/${name}.json`;
  if (!fs.existsSync(snapshot) || process.env.UPDATE_SNAPSHOTS === "1") {
    const newContent = JSON.stringify(unicov.getCoverageData(), null, 2);
    fs.writeFileSync(snapshot, newContent);
    return;
  }
  try {
    const commonCoverageContent = fs.readFileSync(snapshot).toString();
    expect(JSON.parse(commonCoverageContent)).toEqual(unicov.getCoverageData());
  } catch (e: any) {
    console.log(
      `Snapshot test failed for ${name}. If this is expected, execute \`npm run test-update-snapshots\`.`
    );
    throw e;
  }
}

function rimrafAsync(node: string): Promise<null> {
  return new Promise((resolve, reject) => {
    rimraf(node, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });
  });
}

export async function checkOutputSnapshot(
  unicov: Unicov,
  reporterType: CoverageReporterType,
  filename: string
) {
  const snapshot = `./test/fixtures/${filename}`;
  if (!fs.existsSync(snapshot) || process.env.UPDATE_SNAPSHOTS === "1") {
    unicov.toFile(snapshot, reporterType);
    return;
  }
  let dir = null;
  try {
    dir = fs.mkdtempSync(".unicov");
    const outputPath = path.join(dir, "coverage");
    unicov.toFile(outputPath, reporterType);
    expect(fs.readFileSync(outputPath).toString()).toEqual(
      fs.readFileSync(snapshot).toString()
    );
  } catch (e: any) {
    console.log(
      `Snapshot test failed for ${filename}. If this is expected, execute \`npm run test-update-snapshots\`.`
    );
    throw e;
  } finally {
    if (dir) {
      await rimrafAsync(dir);
    }
  }
}
