import { describe, it, expect, vi } from 'vitest';
import { isControlled, resolveControllable, makeControllable } from '../../src/interactions/controllable';

describe('controllable', () => {
  it('isControlled', () => {
    expect(isControlled(undefined)).toBe(false);
    expect(isControlled(0)).toBe(true);
  });

  it('resolveControllable', () => {
    expect(resolveControllable(undefined, 5)).toEqual({ value: 5, isControlled: false });
    expect(resolveControllable(2, 5)).toEqual({ value: 2, isControlled: true });
  });

  it('makeControllable calls onChange for controlled, and setInternal for uncontrolled', () => {
    const onChange = vi.fn();
    const setInternal = vi.fn();

    // controlled
    const controlled = makeControllable({ value: 1, defaultValue: 0, onChange, setInternal });
    controlled.set(2);
    expect(onChange).toHaveBeenCalledWith(2);
    expect(setInternal).not.toHaveBeenCalled();

    onChange.mockClear();

    // uncontrolled
    const uncontrolled = makeControllable({ value: undefined, defaultValue: 0, onChange, setInternal });
    uncontrolled.set(3);
    expect(setInternal).toHaveBeenCalledWith(3);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});