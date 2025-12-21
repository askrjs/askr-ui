import { describe, it, expect } from 'vitest';
import { isActivationKey } from '../../src/foundations/keyboard';

describe('keyboard helpers', () => {
  it('should return true for Enter and Space keys', () => {
    const enter = new KeyboardEvent('keydown', { key: 'Enter' });
    const space = new KeyboardEvent('keydown', { key: ' ' });
    expect(isActivationKey(enter as any)).toBe(true);
    expect(isActivationKey(space as any)).toBe(true);
  });

  it('should return false for other keys', () => {
    const esc = new KeyboardEvent('keydown', { key: 'Escape' });
    expect(isActivationKey(esc as any)).toBe(false);
  });
});