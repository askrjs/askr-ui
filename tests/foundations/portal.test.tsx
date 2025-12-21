import { describe, it, expect } from 'vitest';
import { Portal } from '../../src/foundations/portal';

describe('Portal', () => {
  it('should mount an element into document.body and unmount it', () => {
    const p = Portal();
    expect(document.body.contains(p.element)).toBe(true);
    p.unmount();
    expect(document.body.contains(p.element)).toBe(false);
  });
});