import { describe, it, expect, vi } from 'vitest';
import { mergeProps } from '../../src/interactions/mergeProps';

describe('mergeProps', () => {
  it('computes deterministic merge with handlers composed', () => {
    const calls: string[] = [];
    const injected = { onClick: () => calls.push('inj'), id: 'injected' };
    const base = { onClick: () => calls.push('base'), id: 'base' };

    const res = mergeProps(base, injected as any);
    expect(res.id).toBe('base');
    res.onClick();
    expect(calls).toEqual(['inj', 'base']);
  });
});