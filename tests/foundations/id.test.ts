import { describe, it, expect } from 'vitest';
import { generateId, useId } from '../../src/foundations/id';

describe('id helpers', () => {
  it('generateId returns unique ids with prefix', () => {
    const a = generateId('x');
    const b = generateId('x');
    expect(a).not.toBe(b);
    expect(a.startsWith('x-')).toBe(true);
  });

  it('useId returns an id string', () => {
    const id = useId('u');
    expect(typeof id).toBe('string');
    expect(id.startsWith('u-')).toBe(true);
  });
});