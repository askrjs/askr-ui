import { describe, it, expect, vi } from 'vitest';
import { pressable } from '../../src/interactions/pressable';

describe('pressable', () => {
  it('calls onPress on click when not disabled', () => {
    const onPress = vi.fn();
    const p = pressable({ onPress, isNativeButton: true });

    const e = new Event('click');
    p.onClick(e);

    expect(onPress).toHaveBeenCalledWith(e);
  });

  it('prevents click when disabled', () => {
    const onPress = vi.fn();
    const p = pressable({ onPress, isNativeButton: true, disabled: true });

    const e = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as any as Event;
    p.onClick(e);

    expect(onPress).not.toHaveBeenCalled();
    expect((e as any).preventDefault).toHaveBeenCalled();
    expect((e as any).stopPropagation).toHaveBeenCalled();
  });

  it('adds role and tabIndex for non-native button', () => {
    const p = pressable({ isNativeButton: false });
    expect(p.role).toBe('button');
    expect(p.tabIndex).toBe(0);
  });

  it('sets aria-disabled for disabled non-native host', () => {
    const p = pressable({ isNativeButton: false, disabled: true });
    expect(p['aria-disabled']).toBe('true');
    expect(p.tabIndex).toBe(-1);
  });

  it('activates on Enter keydown', () => {
    const onPress = vi.fn();
    const p = pressable({ onPress, isNativeButton: false });

    const e = new KeyboardEvent('keydown', { key: 'Enter' });
    p.onKeyDown(e as any);

    expect(onPress).toHaveBeenCalled();
  });

  it('activates on Space keyup and prevents default on keydown', () => {
    const onPress = vi.fn();
    const p = pressable({ onPress, isNativeButton: false });

    const kd = new KeyboardEvent('keydown', { key: ' ' });
    // keydown should prevent default but not call onPress
    const kdDefaultSpy = vi.spyOn(kd, 'preventDefault');
    p.onKeyDown(kd as any);
    expect(onPress).not.toHaveBeenCalled();
    expect(kdDefaultSpy).toHaveBeenCalled();

    const ku = new KeyboardEvent('keyup', { key: ' ' });
    const kuDefaultSpy = vi.spyOn(ku, 'preventDefault');
    p.onKeyUp(ku as any);
    expect(onPress).toHaveBeenCalled();
    expect(kuDefaultSpy).toHaveBeenCalled();
  });

  it('does not activate when disabled', () => {
    const onPress = vi.fn();
    const p = pressable({ onPress, isNativeButton: false, disabled: true });

    const e = new KeyboardEvent('keydown', { key: 'Enter' });
    p.onKeyDown(e as any);

    const ku = new KeyboardEvent('keyup', { key: ' ' });
    p.onKeyUp(ku as any);

    expect(onPress).not.toHaveBeenCalled();
  });
});