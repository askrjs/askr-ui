import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  componentFamilies,
  docsCategories,
  removedPublicExports,
  toExportName,
  toSourceImportPath,
} from './component-manifest.js';

const EXPORT_PATTERNS = [
  {
    key: './primitives/*',
    basePath: './dist/components/primitives/*/*',
  },
  {
    key: './composites/*',
    basePath: './dist/components/composites/*/*',
  },
];

function validateRegistry() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const componentsDir = join(__dirname, '../src/components');

  for (const component of componentFamilies) {
    const componentIndexPath = join(
      componentsDir,
      component.bucket,
      component.name,
      'index.ts'
    );

    if (!existsSync(componentIndexPath)) {
      throw new Error(`Missing component entrypoint: ${componentIndexPath}`);
    }
  }
}

function createDistExport(basePath) {
  return {
    types: `${basePath}.d.ts`,
    import: `${basePath}.js`,
    require: `${basePath}.cjs`,
  };
}

function generateComponentsIndex() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const indexPath = join(__dirname, '../src/components/index.ts');
  const lines = [
    '// Generated - do not edit. Run `npm run generate` to update.',
    '',
  ];

  for (const component of componentFamilies) {
    lines.push(`export * from './${component.bucket}/${component.name}';`);
  }

  lines.push('');
  writeFileSync(indexPath, `${lines.join('\n')}`, 'utf8');
}

function generatePublicSurfaceFixture() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const fixturePath = join(__dirname, '../tests/fixtures/public-surface.ts');
  const fixtureDir = dirname(fixturePath);
  mkdirSync(fixtureDir, { recursive: true });

  const lines = [
    '// Generated - do not edit. Run `npm run generate` to update.',
    '',
  ];

  for (const component of componentFamilies) {
    const moduleAlias = `${toExportName(component.name)}Module`;
    lines.push(
      `import * as ${moduleAlias} from '${toSourceImportPath(component.bucket, component.name)}';`
    );
  }

  lines.push('');
  lines.push('export const componentSurface = [');

  for (const component of componentFamilies) {
    const moduleAlias = `${toExportName(component.name)}Module`;
    lines.push(
      `  { bucket: '${component.bucket}', name: '${component.name}', module: ${moduleAlias} },`
    );
  }

  lines.push('] as const;');
  lines.push('');
  lines.push(
    `export const publicValueExports = Array.from(new Set(componentSurface.flatMap((entry) => Object.keys(entry.module).filter((name) => name !== 'default' && !name.startsWith('__'))))).sort();`
  );
  lines.push('');
  lines.push(
    `export const removedPublicExports = ${JSON.stringify(
      removedPublicExports.map((name) => toExportName(name))
    )} as const;`
  );
  lines.push('');
  lines.push(
    `export const docsCategories = ${JSON.stringify(docsCategories, null, 2)} as const;`
  );
  lines.push('');
  writeFileSync(fixturePath, `${lines.join('\n')}`, 'utf8');
}

function removeCategoriesDirectory() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const categoriesDir = join(__dirname, '../src/categories');
  rmSync(categoriesDir, { force: true, recursive: true });
}

function generatePackageJson() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const exportsMap = {
    '.': packageJson.exports['.'],
  };

  for (const exportPattern of EXPORT_PATTERNS) {
    exportsMap[exportPattern.key] = createDistExport(exportPattern.basePath);
  }

  exportsMap['./package.json'] = './package.json';
  packageJson.exports = exportsMap;
  packageJson.scripts = {
    ...packageJson.scripts,
    generate: 'node scripts/generate.js',
  };
  writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8'
  );
}

export function generate() {
  validateRegistry();
  removeCategoriesDirectory();
  generateComponentsIndex();
  generatePackageJson();
  generatePublicSurfaceFixture();
  return componentFamilies.length;
}

if (process.argv[1]) {
  const invokedPath = fileURLToPath(import.meta.url);
  if (process.argv[1] === invokedPath) {
    const count = generate();
    console.log(`Generated ${count} component entries.`);
  }
}
