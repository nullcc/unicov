import * as fs from 'fs';
import { Unicov } from '../src';

describe('Test Unicov.', () => {
  test('Test fromCoverage by json reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'json');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-json-coverage.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by cobertura reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/cobertura-coverage.xml', 'cobertura');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-cobertura-coverage.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by empty cobertura reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/empty-cobertura-coverage.xml', 'cobertura');
    const commonCoverage = unicov.getCoverageData();
    expect(commonCoverage).toEqual({});
  });

  test('Test fromCoverage by jacoco reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/jacoco-coverage.xml', 'jacoco');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-jacoco-coverage.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by xccov reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/xccov-coverage.xml', 'xccov');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-xccov-coverage.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by clover reporter.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/clover-coverage.xml', 'clover');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-clover-coverage.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by json reporter with option "caseSensitive" is false.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'json', { caseInsensitive: true });
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/common-json-coverage-case-insensitive.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverage by auto reporter.', async () => {
    // auto => json
    const unicovJson = await Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'auto');
    const commonCoverageJson = unicovJson.getCoverageData();
    const commonCoverageContentJson = fs.readFileSync('./test/fixtures/common-json-coverage.json').toString();
    expect(commonCoverageJson).toEqual(JSON.parse(commonCoverageContentJson));

    // cobertura
    const unicovCobertura = await Unicov.fromCoverage('./test/fixtures/cobertura-coverage.xml', 'auto');
    const commonCoverageCobertura = unicovCobertura.getCoverageData();
    const commonCoverageContentCobertura = fs.readFileSync('./test/fixtures/common-cobertura-coverage.json').toString();
    expect(commonCoverageCobertura).toEqual(JSON.parse(commonCoverageContentCobertura));

    // jacoco => json
    const unicovJacoco = await Unicov.fromCoverage('./test/fixtures/jacoco-coverage.xml', 'auto');
    const commonCoverageJacoco = unicovJacoco.getCoverageData();
    const commonCoverageContentJacoco = fs.readFileSync('./test/fixtures/common-jacoco-coverage.json').toString();
    expect(commonCoverageJacoco).toEqual(JSON.parse(commonCoverageContentJacoco));

    // auto => xccov
    const unicovXccov = await Unicov.fromCoverage('./test/fixtures/xccov-coverage.xml', 'auto');
    const commonCoverageXccov = unicovXccov.getCoverageData();
    const commonCoverageContentXccov = fs.readFileSync('./test/fixtures/common-xccov-coverage.json').toString();
    expect(commonCoverageXccov).toEqual(JSON.parse(commonCoverageContentXccov));
  });

  test('Test unknown coverage reporter.', async () => {
    await expect(Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'xxx' as any))
      .rejects
      .toThrow("Unknown coverage reporter 'xxx'");
  });

  test('Test coverage file not found.', async () => {
    await expect(Unicov.fromCoverage('./test/fixtures/x.json', 'json'))
      .rejects
      .toThrow('Coverage file not found: ./test/fixtures/x.json!');
  });

  test('Test invalid json coverage file.', async () => {
    await expect(Unicov.fromCoverage('./test/fixtures/invalid-json-coverage.json', 'json'))
      .rejects
      .toThrow('Invalid json coverage reporter: ./test/fixtures/invalid-json-coverage.json');
  });

  test('Test invalid cobertura coverage file.', async () => {
    await expect(Unicov.fromCoverage('./test/fixtures/invalid-cobertura-coverage.xml', 'cobertura'))
      .rejects
      .toThrow('Invalid cobertura coverage reporter: ./test/fixtures/invalid-cobertura-coverage.xml');
  });

  test('Test invalid jacoco coverage file.', async () => {
    await expect(Unicov.fromCoverage('./test/fixtures/invalid-jacoco-coverage.xml', 'jacoco'))
      .rejects
      .toThrow('Invalid jacoco coverage reporter: ./test/fixtures/invalid-jacoco-coverage.xml');
  });

  test('Test getFileLineCoverage.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'json');
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 2)).toEqual(1);
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 17)).toEqual(2);
    expect(unicov.getFileLineCoverage("$PROJECT_PATH/src/calc.ts", 6)).toEqual(-1);
    expect(unicov.getFileLineCoverage("xxx.ts", 3)).toEqual(0);

    const unicov1 = await Unicov.fromCoverage('./test/fixtures/json-coverage.json', 'json');
    unicov1.setCoverageData(null as any);
    expect(unicov1.getFileLineCoverage("xxx.ts", 3)).toEqual(0);
  });

  test('Test fromCoverages with single coverage reporter.', async () => {
    const coverageFiles = [
      './test/fixtures/jacoco-coverage-1.xml',
      './test/fixtures/jacoco-coverage-2.xml'
    ];
    const unicov = await Unicov.fromCoverages(coverageFiles, 'jacoco');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/jacoco-coverage-merged.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test fromCoverages with multi coverage reporters automatically.', async () => {
    const coverageFiles = [
      './test/fixtures/json-coverage.json',
      './test/fixtures/jacoco-coverage.xml',
      './test/fixtures/xccov-coverage.xml'
    ];
    const unicov = await Unicov.fromCoverages(coverageFiles, 'auto');
    const commonCoverage = unicov.getCoverageData();
    const commonCoverageContent = fs.readFileSync('./test/fixtures/coverage-auto-merged.json').toString();
    expect(commonCoverage).toEqual(JSON.parse(commonCoverageContent));
  });

  test('Test getOverallLineCoverage.', async () => {
    const unicov = await Unicov.fromCoverage('./test/fixtures/xccov-coverage.xml', 'xccov');
    expect(unicov.getOverallLineCoverage()).toEqual({
      coveredLines: 4,
      uncoveredLines: 4,
      overallLineCoverageRate: 0.5,
    });
  });
});
