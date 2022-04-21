# unicov

Transforms coverage into an unify coverage format.

Supported coverage reporter types:

* json
* cobertura
* jacoco
* xccov
* clover
* auto (unicov will detect coverage type automatically)

## Installation

```shell script
$ npm i @nullcc/unicov
```

## Usage

Parsing single coverage in a specific type coverage:

```typescript
import { Unicov } from '@nullcc/unicov';

const unicov = await Unicov.fromCoverage('./coverage.json', 'json');
const commonCoverage = unicov.getCoverageData();

// using commonCoverage...
```

Parsing multi coverages in a specific coverage format:

```typescript
import { Unicov } from '@nullcc/unicov';

const coverageFiles = [
  './json-coverage1.json',
  './json-coverage2.json',
  './json-coverage3.json'
];
const unicov = await Unicov.fromCoverages(coverageFiles, 'json');
const commonCoverage = unicov.getCoverageData();

// using commonCoverage...
```

Parsing multi coverages automatically:

```typescript
import { Unicov } from '@nullcc/unicov';

const coverageFiles = [
  './json-coverage.json',
  './jacoco-empty-cobertura-coverage.xml',
  './cobertura-empty-cobertura-coverage.xml',
  './xccov-empty-cobertura-coverage.xml'
];

const unicov = await Unicov.fromCoverages(coverageFiles, 'auto');
const commonCoverage = unicov.getCoverageData();

// using commonCoverage...
```

## Publish

```shell script
$ npm publish --access public
```
