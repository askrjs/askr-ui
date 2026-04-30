import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(scriptDir, '../package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

if (packageJson.exports?.['./foundations']) {
  throw new Error('Unexpected ./foundations export in @askrjs/ui package.json');
}

const foundationsDir = join(scriptDir, '../src/foundations');
try {
  const entries = await readdir(foundationsDir);
  if (entries.length > 0) {
    throw new Error(
      `Foundations source directory still exists: ${foundationsDir}`
    );
  }
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(absolutePath);
      continue;
    }

    if (entry.isFile()) {
      yield absolutePath;
    }
  }
}

for await (const absolutePath of walk(join(scriptDir, '../src'))) {
  const contents = await readFile(absolutePath, 'utf8');
  if (contents.includes('@askrjs/ui/foundations')) {
    throw new Error(`Unexpected legacy foundations import in ${absolutePath}`);
  }
}

console.log(
  'Foundations ownership verified: no local foundations entrypoint remains.'
);
