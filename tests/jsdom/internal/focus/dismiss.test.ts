import { describe, expect, it, vi } from 'vite-plus/test';
import { dismissPopupWithTab } from '../../../../src/components/_internal/focus/dismiss';

function tabEvent(shiftKey = false) {
  return {
    key: 'Tab',
    shiftKey,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent;
}

describe('dismissPopupWithTab', () => {
  it('should ignore non-Tab keys', () => {
    const onDismiss = vi.fn();
    const event = { key: 'Enter' } as KeyboardEvent;
    const handled = dismissPopupWithTab(event, null, [], onDismiss);
    expect(handled).toBe(false);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should call onDismiss and report handled on Tab even without a destination', () => {
    const onDismiss = vi.fn();
    const event = tabEvent();
    const handled = dismissPopupWithTab(event, null, [], onDismiss);
    expect(handled).toBe(true);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('should move focus past the trigger to the next tabbable candidate excluding excluded roots', async () => {
    document.body.innerHTML = `
      <button id="before">before</button>
      <button id="trigger">trigger</button>
      <div id="popup"><button id="in-popup">in popup</button></div>
      <button id="after">after</button>
    `;
    const trigger = document.getElementById('trigger') as HTMLElement;
    const popup = document.getElementById('popup') as HTMLElement;
    const after = document.getElementById('after') as HTMLElement;
    const onDismiss = vi.fn();
    const event = tabEvent();

    const handled = dismissPopupWithTab(event, trigger, [popup], onDismiss);

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(after);
  });
});
