import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function walkSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(absolutePath));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

describe('Foundations contract', () => {
  it('keeps the legacy local foundations entrypoint out of the package', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    ) as { exports: Record<string, unknown> };

    expect(packageJson.exports?.['./foundations']).toBeUndefined();

    try {
      const entries = readdirSync(join(process.cwd(), 'src', 'foundations'));
      expect(entries).toHaveLength(0);
    } catch (error) {
      if ((error as { code?: string }).code !== 'ENOENT') {
        throw error;
      }
    }

    for (const absolutePath of walkSourceFiles(join(process.cwd(), 'src'))) {
      const contents = readFileSync(absolutePath, 'utf8');
      expect(contents.includes('@askrjs/ui/foundations')).toBe(false);
    }
  });
});
