import { type Locator, expect, test } from '@playwright/test';

/**
 * One `(label, first, second)` triple produced by `deterministicRender` in a
 * scenario module. The render pair has to cross the Node/browser boundary as
 * data because the JSX factory it compares cannot.
 */
export interface DeterministicRender {
  label: string;
  first: string;
  second: string;
}

/**
 * Asserts every render pair a determinism scenario produced is stable.
 *
 * Each pair gets its own `test.step`, which is how the label survives the port:
 * vitest's `expect(actual, message)` has no Playwright equivalent, so the step
 * name is what names the failing tree in the report.
 */
export async function expectDeterministic(
  renders: DeterministicRender[]
): Promise<void> {
  expect(renders.length).toBeGreaterThan(0);
  for (const render of renders) {
    await test.step(`deterministic render: ${render.label}`, () => {
      expect(render.first).toBe(render.second);
    });
  }
}

/** Pins the current host so later focus checks cannot accept a replacement. */
export async function captureFocusTarget(
  locator: Locator
): Promise<() => Promise<void>> {
  const original = await locator.elementHandle();
  expect(original).not.toBeNull();

  return async () => {
    expect(
      await original!.evaluate((node) => document.activeElement === node)
    ).toBe(true);
  };
}
