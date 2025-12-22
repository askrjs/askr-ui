import { describe, it, expect } from 'vitest';
import { focusable } from '../../src/interactions/focusable';

describe('focusable', () => {
  it('returns tabIndex 0 for unspecified', () => {
    expect(focusable({}).tabIndex).toBe(0);
  });

  it('returns -1 when disabled', () => {
    expect(focusable({ disabled: true }).tabIndex).toBe(-1);
    expect(focusable({ disabled: true })['aria-disabled']).toBe('true');
  });

  it('respects provided tabIndex', () => {
    expect(focusable({ tabIndex: 2 }).tabIndex).toBe(2);
  });
});