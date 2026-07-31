import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const root = process.cwd();
const temporary = mkdtempSync(join(tmpdir(), 'askr-ui-pack-'));

try {
  const packed = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
      { cwd: root, encoding: 'utf8' }
    )
  )[0];
  const forbidden =
    /(?:^|\/)(?:node_modules|\.cache|coverage)(?:\/|$)|\.tsbuildinfo$/;
  const files = packed.files.map(({ path }) => path);
  const rejected = files.filter((path) => forbidden.test(path));
  if (rejected.length > 0) {
    throw new Error(`Forbidden packed files:\n${rejected.join('\n')}`);
  }

  const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8')
  );
  const targets = Object.values(packageJson.exports)
    .flatMap((value) =>
      typeof value === 'string' ? [value] : Object.values(value)
    )
    .filter(
      (value) => typeof value === 'string' && value.startsWith('./dist/')
    );
  const missing = targets.filter(
    (target) => !existsSync(resolve(root, target))
  );
  if (missing.length > 0) {
    throw new Error(`Missing export targets:\n${missing.join('\n')}`);
  }

  const consumer = join(temporary, 'consumer');
  mkdirSync(consumer);
  const tarball = join(temporary, basename(packed.filename));
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: {
        '@askrjs/askr': `file:${join(root, 'node_modules/@askrjs/askr')}`,
        '@askrjs/ui': `file:${tarball}`,
        typescript: `file:${join(root, 'node_modules/typescript')}`,
      },
    })
  );
  writeFileSync(
    join(consumer, 'consumer.ts'),
    `import { Button, HoverCard, ScrollArea } from '@askrjs/ui';
import { DropdownItem } from '@askrjs/ui/dropdown';
import { MenuItem } from '@askrjs/ui/menu';
import { MenubarItem } from '@askrjs/ui/menubar';
import { SelectItem } from '@askrjs/ui/select';
void [Button, HoverCard, ScrollArea, DropdownItem, MenuItem, MenubarItem, SelectItem];
`
  );
  writeFileSync(
    join(consumer, 'consumer.mjs'),
    `import { Button, HoverCard, ScrollArea } from '@askrjs/ui';
import { DropdownItem } from '@askrjs/ui/dropdown';
if (![Button, HoverCard, ScrollArea, DropdownItem].every(Boolean)) process.exit(1);
`
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2022',
        skipLibCheck: false,
        noEmit: true,
      },
      files: ['consumer.ts'],
    })
  );
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund'],
    {
      cwd: consumer,
      stdio: 'inherit',
    }
  );
  execFileSync('node', ['consumer.mjs'], { cwd: consumer, stdio: 'inherit' });
  execFileSync(
    join(consumer, 'node_modules/.bin/tsc'),
    ['-p', 'tsconfig.json'],
    { cwd: consumer, stdio: 'inherit' }
  );
  console.log(`Validated ${files.length} packed files and isolated ESM/types.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
