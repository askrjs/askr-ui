import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const GROUP_FAMILIES = [
  'accordion',
  'dropdown',
  'menu',
  'menubar',
  'radio-group',
  'select',
  'slider',
  'toggle-group',
] as const;

const DYNAMIC_CHILDREN_TYPE_DOC =
  'Supports literal, nested, array-mapped, and `For`-rendered descendants.';

describe('dynamic children public contract', () => {
  it('should document every context-coordinated group family', () => {
    const docs = readFileSync(
      join(process.cwd(), 'docs', 'components.md'),
      'utf8'
    );

    for (const family of GROUP_FAMILIES) {
      expect(docs).toContain(`| \`${family}\``);
    }

    expect(docs).toContain(
      'Dynamic descendants are a supported composition contract'
    );
    const dynamicDescendantsSection = docs
      .split('## Dynamic descendants')[1]
      ?.split('\n## ')[0];
    expect(dynamicDescendantsSection).toBeDefined();
    expect(dynamicDescendantsSection).not.toContain('literal children only');
  });

  it('should keep dynamic descendant support visible in root prop type docs', () => {
    for (const family of GROUP_FAMILIES) {
      const types = readFileSync(
        join(process.cwd(), 'src', 'components', family, `${family}.types.ts`),
        'utf8'
      );

      expect(types, family).toContain(DYNAMIC_CHILDREN_TYPE_DOC);
    }
  });
});
