import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import * as askrUi from '../src';
import {
  componentSurface,
  publicValueExports,
  removedPublicExports,
} from './fixtures/public-surface';

function isPublicValueExport(name: string) {
  return name !== 'default' && !name.startsWith('__');
}

describe('Public API', () => {
  it('matches the manifest-driven surface from the root entrypoint', () => {
    expect('createAskRComponent' in askrUi).toBe(false);
    expect('AskRComponent' in askrUi).toBe(false);

    const sourceExportNames = Array.from(
      new Set(
        componentSurface.flatMap((entry) =>
          Object.keys(entry.module).filter(isPublicValueExport)
        )
      )
    ).sort();

    expect(publicValueExports).toEqual(sourceExportNames);

    for (const entry of componentSurface) {
      for (const exportName of Object.keys(entry.module).filter(
        isPublicValueExport
      )) {
        expect(exportName in askrUi).toBe(true);
        expect(
          (askrUi as Record<string, unknown>)[exportName]
        ).toBe((entry.module as Record<string, unknown>)[exportName]);
      }
    }

    for (const removedExport of removedPublicExports) {
      expect(removedExport in askrUi).toBe(false);
    }
  });

  it('removes the old layout alias folders from the source tree', () => {
    for (const alias of removedPublicExports) {
      expect(
        existsSync(
          join(process.cwd(), 'src/components/primitives', alias.toLowerCase())
        )
      ).toBe(false);
    }
  });
});
