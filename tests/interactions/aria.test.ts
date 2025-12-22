import { describe, it, expect } from 'vitest';
import { ariaDisabled, ariaExpanded, ariaSelected } from '../../src/interactions/aria';

describe('aria helpers', () => {
  it('ariaDisabled', () => {
    expect(ariaDisabled(true)).toEqual({ 'aria-disabled': 'true' });
    expect(ariaDisabled(false)).toEqual({});
  });

  it('ariaExpanded', () => {
    expect(ariaExpanded(true)).toEqual({ 'aria-expanded': 'true' });
    expect(ariaExpanded(false)).toEqual({ 'aria-expanded': 'false' });
  });

  it('ariaSelected', () => {
    expect(ariaSelected(true)).toEqual({ 'aria-selected': 'true' });
    expect(ariaSelected(false)).toEqual({ 'aria-selected': 'false' });
  });
});