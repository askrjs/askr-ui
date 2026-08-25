import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import * as askrUi from '../../../src';
import {
  componentSurface,
  publicValueExports,
  removedPublicExports,
} from '../../fixtures/public-surface';

function isPublicValueExport(name: string) {
  return name !== 'default' && !name.startsWith('__');
}

describe('Public API', () => {
  it('should match the manifest-driven surface from the root entrypoint', () => {
    const sourceExportNames = Array.from(
      new Set(
        componentSurface.flatMap((entry) =>
          Object.keys(entry.module).filter(isPublicValueExport)
        )
      )
    ).sort();

    expect(publicValueExports).toEqual(sourceExportNames);
    expect(Object.keys(askrUi).filter(isPublicValueExport).sort()).toEqual(
      publicValueExports
    );

    for (const entry of componentSurface) {
      for (const exportName of Object.keys(entry.module).filter(
        isPublicValueExport
      )) {
        expect(exportName in askrUi).toBe(true);
        expect((askrUi as Record<string, unknown>)[exportName]).toBe(
          (entry.module as Record<string, unknown>)[exportName]
        );
      }
    }

    for (const removedExport of removedPublicExports) {
      expect(removedExport in askrUi).toBe(false);
    }
  });
  it('should only advertise capabilities that the package actually exports', () => {
    const capabilities = JSON.parse(
      readFileSync(join(process.cwd(), 'capabilities.json'), 'utf8')
    ) as {
      capabilities: { exports?: string[]; import: string }[];
    };
    const advertised = Array.from(
      new Set(capabilities.capabilities.flatMap((entry) => entry.exports ?? []))
    ).sort();
    const missing = advertised.filter((name) => !(name in askrUi));

    expect(missing).toEqual([]);
    expect(advertised.length).toBeGreaterThan(0);
  });
});
