import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Presence } from '../../src/foundations/presence';

describe('Presence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should remove element after exitDuration and call onExitComplete when hidden', () => {
    const onExit = vi.fn();
    const p = Presence({ children: 'x', exitDuration: 200, onExitComplete: onExit });
    document.body.appendChild(p.element);

    expect(document.body.contains(p.element)).toBe(true);

    p.setPresent(false);
    expect(p.element.getAttribute('data-exiting')).toBe('true');

    // Fast-forward
    vi.advanceTimersByTime(199);
    expect(document.body.contains(p.element)).toBe(true);
    expect(onExit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(document.body.contains(p.element)).toBe(false);
    expect(onExit).toHaveBeenCalled();

    p.unmount();
  });

  it('should re-show element when setPresent(true) after hide before timeout', () => {
    const onExit = vi.fn();
    const p = Presence({ children: 'x', exitDuration: 200, onExitComplete: onExit });
    document.body.appendChild(p.element);

    p.setPresent(false);
    expect(p.element.getAttribute('data-exiting')).toBe('true');

    // Re-show before timeout
    p.setPresent(true);
    expect(document.body.contains(p.element)).toBe(true);
    expect(p.element.getAttribute('data-exiting')).toBe(null);

    vi.advanceTimersByTime(300);
    expect(document.body.contains(p.element)).toBe(true);
    expect(onExit).not.toHaveBeenCalled();

    p.unmount();
  });
});