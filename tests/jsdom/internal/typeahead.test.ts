import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { handleTypeaheadKeyDown } from '../../../src/components/_internal/typeahead';

describe('typeahead collection resolution', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not resolve collection items for a navigation key', () => {
    const identity = {};
    const resolveOptions = vi.fn(() => ({
      currentIndex: -1,
      items: [{ disabled: false, text: 'Alpha' }],
      onMatch: vi.fn(),
    }));

    expect(
      handleTypeaheadKeyDown(
        identity,
        new KeyboardEvent('keydown', { key: 'ArrowDown' }),
        resolveOptions
      )
    ).toBe(false);
    expect(resolveOptions).not.toHaveBeenCalled();
  });

  it('should resolve collection items and match printable keys', () => {
    vi.useFakeTimers();
    const identity = {};
    const onMatch = vi.fn();
    const resolveOptions = vi.fn(() => ({
      currentIndex: -1,
      items: [{ disabled: false, text: 'Alpha' }],
      onMatch,
    }));
    const event = new KeyboardEvent('keydown', { key: 'A', cancelable: true });

    expect(handleTypeaheadKeyDown(identity, event, resolveOptions)).toBe(true);
    expect(resolveOptions).toHaveBeenCalledOnce();
    expect(onMatch).toHaveBeenCalledWith(0);
    expect(event.defaultPrevented).toBe(true);
  });
});
