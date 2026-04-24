import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const componentsIndexPath = path.join(rootDir, 'src/components/index.ts');
const sourceComponentsDir = path.join(rootDir, 'src/components');
const componentTestsDir = path.join(rootDir, 'tests/components');
const testsDir = path.join(rootDir, 'tests');
const benchesDir = path.join(rootDir, 'benches/components');
const docsDir = path.join(rootDir, 'docs');
const readmePath = path.join(rootDir, 'README.md');
const logPath = path.join(rootDir, 'bench-results.log');

const SOURCE_BUCKETS = ['primitives', 'composites', 'patterns'];
const BUCKET_ORDER = new Map(
  SOURCE_BUCKETS.map((bucket, index) => [bucket, index])
);

function parseArgs(argv) {
  return {
    verify: argv.includes('--verify'),
  };
}

function toExportName(name) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('');
}

function parsePublicFamilies(source) {
  const exportPattern =
    /export \* from ['"]\.\/(primitives|composites|patterns)\/([a-z0-9-]+)['"];/g;
  const families = [];

  for (const match of source.matchAll(exportPattern)) {
    const [, bucket, name] = match;
    families.push({
      bucket,
      name,
      exportName: toExportName(name),
    });
  }

  return families;
}

function createFamilyKey(family) {
  return `${family.bucket}:${family.name}`;
}

function compareFamilies(left, right) {
  const bucketDelta =
    (BUCKET_ORDER.get(left.bucket) ?? Number.MAX_SAFE_INTEGER) -
    (BUCKET_ORDER.get(right.bucket) ?? Number.MAX_SAFE_INTEGER);

  if (bucketDelta !== 0) {
    return bucketDelta;
  }

  return left.name.localeCompare(right.name);
}

function toRelativePath(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function toBaseName(filePath) {
  return path.posix.basename(filePath);
}

function formatFamilyLabel(family) {
  return `${family.exportName} [${family.bucket}]`;
}

function formatList(values) {
  return values.length > 0 ? values.join(', ') : 'missing';
}

function formatSuiteList(suites) {
  return suites.length > 0 ? suites.join(', ') : 'missing';
}

async function readDirectoryEntries(dirPath) {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(dirPath) {
  const entries = await readDirectoryEntries(dirPath);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function listFiles(dirPath, matcher) {
  const entries = await readDirectoryEntries(dirPath);
  return entries
    .filter((entry) => entry.isFile() && matcher(entry.name))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function walkFiles(dirPath, matcher) {
  const entries = await readDirectoryEntries(dirPath);
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath, matcher)));
      continue;
    }

    if (entry.isFile() && matcher(entry.name, entryPath)) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function extractImportedSymbols(source, modulePatternSource) {
  const importPattern = new RegExp(
    `import\\s*{([^}]*)}\\s*from\\s*['\"]${modulePatternSource}['\"];?`,
    'g'
  );
  const symbols = new Set();

  for (const match of source.matchAll(importPattern)) {
    const [, importBlock] = match;
    const entries = importBlock
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    for (const entry of entries) {
      const normalizedEntry = entry.replace(/^type\s+/, '');
      const aliasParts = normalizedEntry.split(/\s+as\s+/);
      symbols.add(aliasParts[0].trim());
    }
  }

  return [...symbols];
}

function isFamilySymbolMatch(symbol, exportName) {
  if (symbol === exportName) {
    return true;
  }

  if (!symbol.startsWith(exportName) || symbol.length <= exportName.length) {
    return false;
  }

  return /[A-Z]/.test(symbol[exportName.length] ?? '');
}

function matchSymbolToFamily(symbol, families) {
  for (const family of families) {
    if (isFamilySymbolMatch(symbol, family.exportName)) {
      return family;
    }
  }

  return null;
}

function createMatchableFamilies(sourceFamilies, publicFamilies) {
  const byKey = new Map();

  for (const family of [...sourceFamilies, ...publicFamilies]) {
    const key = createFamilyKey(family);
    if (!byKey.has(key)) {
      byKey.set(key, {
        bucket: family.bucket,
        name: family.name,
        exportName: family.exportName ?? toExportName(family.name),
      });
    }
  }

  return [...byKey.values()].sort((left, right) => {
    if (right.exportName.length !== left.exportName.length) {
      return right.exportName.length - left.exportName.length;
    }

    return compareFamilies(left, right);
  });
}

async function collectSourceFamilies() {
  const families = [];

  for (const bucket of SOURCE_BUCKETS) {
    const bucketDir = path.join(sourceComponentsDir, bucket);
    const componentDirs = await listDirectories(bucketDir);

    for (const name of componentDirs) {
      families.push({
        bucket,
        name,
        exportName: toExportName(name),
        sourcePath: toRelativePath(path.join(bucketDir, name)),
      });
    }
  }

  return families.sort(compareFamilies);
}

function getTestSuiteKind(filePath) {
  return toBaseName(filePath).replace(/\.test\.tsx?$/, '');
}

async function collectComponentTestInventory() {
  const directoryNames = await listDirectories(componentTestsDir);
  const records = [];

  for (const name of directoryNames) {
    const dirPath = path.join(componentTestsDir, name);
    const testFiles = (
      await listFiles(dirPath, (fileName) => /\.test\.tsx?$/.test(fileName))
    ).map(toRelativePath);
    const suites = [...testFiles]
      .map(getTestSuiteKind)
      .sort((left, right) => left.localeCompare(right));

    records.push({
      name,
      dirPath: toRelativePath(dirPath),
      testFiles,
      suites,
    });
  }

  return records.sort((left, right) => left.name.localeCompare(right.name));
}

async function collectGlobalTestFiles() {
  return (
    await listFiles(testsDir, (fileName) => /\.test\.tsx?$/.test(fileName))
  ).map(toRelativePath);
}

function createCoverageMap(families) {
  return new Map(
    families.map((family) => [createFamilyKey(family), new Set()])
  );
}

function createSortedCoverageMap(coverageSets) {
  return new Map(
    [...coverageSets.entries()].map(([familyKey, values]) => [
      familyKey,
      [...values].sort((left, right) => left.localeCompare(right)),
    ])
  );
}

async function collectBenchInventory(matchableFamilies) {
  const benchFiles = (
    await listFiles(benchesDir, (fileName) => /\.bench\.tsx?$/.test(fileName))
  ).map(toRelativePath);
  const coverageSets = createCoverageMap(matchableFamilies);
  const records = [];

  for (const benchFile of benchFiles) {
    const benchPath = path.join(rootDir, benchFile);
    const benchSource = await fs.readFile(benchPath, 'utf8');
    const importedSymbols = extractImportedSymbols(
      benchSource,
      '\\.\\.\\/\\.\\.\\/src\\/components(?:\\/[^\'\\"]+)?'
    );
    const matchedFamilies = [];
    const matchedKeys = new Set();

    for (const symbol of importedSymbols) {
      const family = matchSymbolToFamily(symbol, matchableFamilies);
      if (!family) {
        continue;
      }

      const familyKey = createFamilyKey(family);
      if (matchedKeys.has(familyKey)) {
        continue;
      }

      matchedKeys.add(familyKey);
      matchedFamilies.push(family);
      coverageSets.get(familyKey)?.add(benchFile);
    }

    records.push({
      filePath: benchFile,
      families: matchedFamilies.sort(compareFamilies),
    });
  }

  return {
    benchFiles: records,
    coverageByFamily: createSortedCoverageMap(coverageSets),
    unmappedBenchFiles: records
      .filter((record) => record.families.length === 0)
      .map((record) => record.filePath),
  };
}

async function collectDocsInventory(matchableFamilies) {
  const docFiles = [];

  if (await pathExists(readmePath)) {
    docFiles.push(readmePath);
  }

  docFiles.push(
    ...(await walkFiles(docsDir, (fileName) => fileName.endsWith('.md')))
  );
  docFiles.sort((left, right) => left.localeCompare(right));

  const coverageSets = createCoverageMap(matchableFamilies);
  const records = [];

  for (const docPath of docFiles) {
    const docSource = await fs.readFile(docPath, 'utf8');
    const importedSymbols = extractImportedSymbols(
      docSource,
      '@askrjs\\/askr-ui(?:\\/[^\'\\"]+)?'
    );
    const matchedFamilies = [];
    const matchedKeys = new Set();

    for (const symbol of importedSymbols) {
      const family = matchSymbolToFamily(symbol, matchableFamilies);
      if (!family) {
        continue;
      }

      const familyKey = createFamilyKey(family);
      if (matchedKeys.has(familyKey)) {
        continue;
      }

      matchedKeys.add(familyKey);
      matchedFamilies.push(family);
      coverageSets.get(familyKey)?.add(toRelativePath(docPath));
    }

    records.push({
      filePath: toRelativePath(docPath),
      families: matchedFamilies.sort(compareFamilies),
    });
  }

  return {
    docsFiles: records,
    coverageByFamily: createSortedCoverageMap(coverageSets),
    docsFilesWithPublicFamilies: records.filter(
      (record) => record.families.length > 0
    ),
  };
}

function buildPublicRecords(
  publicFamilies,
  sourceFamilies,
  componentTestRecords,
  benchInventory,
  docsInventory
) {
  const sourceByKey = new Map(
    sourceFamilies.map((family) => [createFamilyKey(family), family])
  );
  const testsByName = new Map(
    componentTestRecords.map((record) => [record.name, record])
  );

  return publicFamilies
    .map((family) => {
      const familyKey = createFamilyKey(family);
      const sourceFamily = sourceByKey.get(familyKey);
      const testRecord = testsByName.get(family.name);

      return {
        ...family,
        familyKey,
        sourcePath: sourceFamily?.sourcePath ?? null,
        testDir: testRecord?.dirPath ?? null,
        testFiles: testRecord?.testFiles ?? [],
        testSuites: testRecord?.suites ?? [],
        benchFiles: benchInventory.coverageByFamily.get(familyKey) ?? [],
        docsFiles: docsInventory.coverageByFamily.get(familyKey) ?? [],
      };
    })
    .sort(compareFamilies);
}

function buildSourceOnlyRecords(
  sourceFamilies,
  publicFamilies,
  componentTestRecords,
  benchInventory,
  docsInventory
) {
  const publicKeys = new Set(publicFamilies.map(createFamilyKey));
  const testsByName = new Map(
    componentTestRecords.map((record) => [record.name, record])
  );

  return sourceFamilies
    .filter((family) => !publicKeys.has(createFamilyKey(family)))
    .map((family) => {
      const familyKey = createFamilyKey(family);
      const testRecord = testsByName.get(family.name);

      return {
        ...family,
        familyKey,
        testDir: testRecord?.dirPath ?? null,
        testFiles: testRecord?.testFiles ?? [],
        testSuites: testRecord?.suites ?? [],
        benchFiles: benchInventory.coverageByFamily.get(familyKey) ?? [],
        docsFiles: docsInventory.coverageByFamily.get(familyKey) ?? [],
      };
    })
    .sort(compareFamilies);
}

function buildTestOnlyRecords(componentTestRecords, sourceFamilies) {
  const sourceNames = new Set(sourceFamilies.map((family) => family.name));

  return componentTestRecords.filter((record) => !sourceNames.has(record.name));
}

function renderSummary(summary) {
  return [
    '# Repository Inventory',
    '',
    'Generated from `src/components/index.ts`, source component directories, `tests/components`, `benches/components`, and markdown docs.',
    '',
    `- Public component families: ${summary.totalFamilies}`,
    `- Source component directories: ${summary.totalSourceFamilies}`,
    `- Public families with source directories: ${summary.publicWithSource}`,
    `- Public families with component tests: ${summary.publicWithTests}`,
    `- Public families with benches: ${summary.publicWithBenches}`,
    `- Public families with docs references: ${summary.publicWithDocs}`,
    `- Source-only component directories: ${summary.sourceOnlyFamilies}`,
    `- Component test directories: ${summary.totalComponentTestDirs}`,
    `- Component test files: ${summary.totalComponentTestFiles}`,
    `- Test-only directories: ${summary.testOnlyDirs}`,
    `- Global test files: ${summary.globalTestFiles}`,
    `- Bench source files: ${summary.totalBenchFiles}`,
    `- Unmapped bench files: ${summary.unmappedBenchFiles}`,
    `- Docs files scanned: ${summary.totalDocsFiles}`,
    `- Docs files with public component references: ${summary.docsFilesWithPublicFamilies}`,
    '',
  ];
}

function renderGapSection(title, families) {
  const lines = [`### ${title}`, ''];

  if (families.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const family of families) {
    lines.push(`- ${formatFamilyLabel(family)}`);
  }

  lines.push('');
  return lines;
}

function renderPublicCoverageGaps(gaps) {
  return [
    '## Public Coverage Gaps',
    '',
    ...renderGapSection('Missing Source Directories', gaps.missingSource),
    ...renderGapSection('Missing Component Tests', gaps.missingTests),
    ...renderGapSection('Missing Benches', gaps.missingBenches),
    ...renderGapSection('Missing Docs References', gaps.missingDocs),
  ];
}

function renderComponentInventory(title, records) {
  const lines = [`## ${title}`, ''];

  if (records.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const record of records) {
    lines.push(
      `- ${formatFamilyLabel(record)}: source ${record.sourcePath ?? 'missing'}; tests ${formatSuiteList(
        record.testSuites
      )}; benches ${formatList(record.benchFiles.map(toBaseName))}; docs ${formatList(
        record.docsFiles
      )}`
    );
  }

  lines.push('');
  return lines;
}

function renderComponentTestInventory(records) {
  const lines = ['## Component Test Inventory', ''];

  if (records.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const record of records) {
    lines.push(
      `- ${record.dirPath}: ${formatList(record.testFiles.map(toBaseName))}`
    );
  }

  lines.push('');
  return lines;
}

function renderTestOnlyInventory(records) {
  const lines = ['## Test-Only Directories', ''];

  if (records.length === 0) {
    lines.push('- none', '');
    lines.push('');
    return lines;
  }

  for (const record of records) {
    lines.push(
      `- ${record.dirPath}: ${formatList(record.testFiles.map(toBaseName))}`
    );
  }

  lines.push('');
  return lines;
}

function renderGlobalTests(files) {
  const lines = ['## Global Test Files', ''];

  if (files.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const file of files) {
    lines.push(`- ${file}`);
  }

  lines.push('');
  return lines;
}

function renderBenchInventory(records) {
  const lines = ['## Bench Inventory', ''];

  if (records.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const record of records) {
    lines.push(
      `- ${record.filePath}: ${formatList(record.families.map((family) => family.name))}`
    );
  }

  lines.push('');
  return lines;
}

function renderDocsInventory(records) {
  const lines = ['## Docs Inventory', ''];

  if (records.length === 0) {
    lines.push('- none', '');
    return lines;
  }

  for (const record of records) {
    lines.push(
      `- ${record.filePath}: ${formatList(record.families.map((family) => family.name))}`
    );
  }

  lines.push('');
  return lines;
}

async function collectInventory() {
  const [
    componentsIndexSource,
    sourceFamilies,
    componentTestRecords,
    globalTestFiles,
  ] = await Promise.all([
    fs.readFile(componentsIndexPath, 'utf8'),
    collectSourceFamilies(),
    collectComponentTestInventory(),
    collectGlobalTestFiles(),
  ]);

  const families = parsePublicFamilies(componentsIndexSource);
  const matchableFamilies = createMatchableFamilies(sourceFamilies, families);
  const [benchInventory, docsInventory] = await Promise.all([
    collectBenchInventory(matchableFamilies),
    collectDocsInventory(matchableFamilies),
  ]);

  const publicRecords = buildPublicRecords(
    families,
    sourceFamilies,
    componentTestRecords,
    benchInventory,
    docsInventory
  );
  const sourceOnlyRecords = buildSourceOnlyRecords(
    sourceFamilies,
    families,
    componentTestRecords,
    benchInventory,
    docsInventory
  );
  const testOnlyRecords = buildTestOnlyRecords(
    componentTestRecords,
    sourceFamilies
  );

  const missingSource = publicRecords.filter((record) => !record.sourcePath);
  const missingTests = publicRecords.filter(
    (record) => record.testFiles.length === 0
  );
  const missingBenches = publicRecords.filter(
    (record) => record.benchFiles.length === 0
  );
  const missingDocs = publicRecords.filter(
    (record) => record.docsFiles.length === 0
  );

  return {
    families,
    sourceFamilies,
    publicRecords,
    sourceOnlyRecords,
    componentTestRecords,
    testOnlyRecords,
    globalTestFiles,
    benchInventory,
    docsInventory,
    missingSource,
    missingTests,
    missingBenches,
    missingDocs,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inventory = await collectInventory();

  const lines = [
    ...renderSummary({
      totalFamilies: inventory.families.length,
      totalSourceFamilies: inventory.sourceFamilies.length,
      publicWithSource:
        inventory.publicRecords.length - inventory.missingSource.length,
      publicWithTests:
        inventory.publicRecords.length - inventory.missingTests.length,
      publicWithBenches:
        inventory.publicRecords.length - inventory.missingBenches.length,
      publicWithDocs:
        inventory.publicRecords.length - inventory.missingDocs.length,
      sourceOnlyFamilies: inventory.sourceOnlyRecords.length,
      totalComponentTestDirs: inventory.componentTestRecords.length,
      totalComponentTestFiles: inventory.componentTestRecords.reduce(
        (count, record) => count + record.testFiles.length,
        0
      ),
      testOnlyDirs: inventory.testOnlyRecords.length,
      globalTestFiles: inventory.globalTestFiles.length,
      totalBenchFiles: inventory.benchInventory.benchFiles.length,
      unmappedBenchFiles: inventory.benchInventory.unmappedBenchFiles.length,
      totalDocsFiles: inventory.docsInventory.docsFiles.length,
      docsFilesWithPublicFamilies:
        inventory.docsInventory.docsFilesWithPublicFamilies.length,
    }),
    ...renderPublicCoverageGaps({
      missingSource: inventory.missingSource,
      missingTests: inventory.missingTests,
      missingBenches: inventory.missingBenches,
      missingDocs: inventory.missingDocs,
    }),
    ...renderComponentInventory(
      'Public Component Inventory',
      inventory.publicRecords
    ),
    ...renderComponentInventory(
      'Source-Only Component Inventory',
      inventory.sourceOnlyRecords
    ),
    ...renderComponentTestInventory(inventory.componentTestRecords),
    ...renderTestOnlyInventory(inventory.testOnlyRecords),
    ...renderGlobalTests(inventory.globalTestFiles),
    ...renderBenchInventory(inventory.benchInventory.benchFiles),
    ...renderDocsInventory(inventory.docsInventory.docsFiles),
  ];

  await fs.writeFile(logPath, `${lines.join('\n')}`, 'utf8');

  console.log(
    `Wrote repository inventory for ${inventory.families.length} public component families to ${path.basename(logPath)}.`
  );

  const verificationFailures = [
    ['missing source directories', inventory.missingSource.length],
    ['missing component tests', inventory.missingTests.length],
    ['missing benches', inventory.missingBenches.length],
    ['missing docs references', inventory.missingDocs.length],
    [
      'unmapped bench files',
      inventory.benchInventory.unmappedBenchFiles.length,
    ],
  ].filter(([, count]) => count > 0);

  if (options.verify && verificationFailures.length > 0) {
    console.error(
      `[inventory:verify] ${verificationFailures
        .map(([label, count]) => `${count} ${label}`)
        .join('; ')}.`
    );
    process.exitCode = 1;
  }
}

await main();
