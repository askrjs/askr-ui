import { describe, it, expect } from 'vitest';
import { composeHandlers } from '../../src/interactions/composeHandlers';

describe('composeHandlers', () => {
  it('runs first handler then second handler', () => {
    const calls: string[] = [];
    const a = () => calls.push('a');
    const b = () => calls.push('b');

    const c = composeHandlers(a, b);
    c();
    expect(calls).toEqual(['a', 'b']);
  });

  it('respects event.defaultPrevented', () => {
    const a = (e: any) => e.preventDefault();
    const b = (e: any) => e();
    const spy = () => {};
    const c = composeHandlers(a, spy);

    const e = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } } as any;
    c(e);
    expect(e.defaultPrevented).toBe(true);
  });
});