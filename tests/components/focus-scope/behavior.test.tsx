import { afterEach, describe, expect, it } from 'vite-plus/test';
import { FocusScope } from '../../../src/components/composites/focus-scope';
import { mount, unmount } from '../../test-utils';

describe('FocusScope - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
    document.body.innerHTML = '';
  });

  it('supports manual focus inside the scope without breaking the focus target', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Before';
    document.body.appendChild(trigger);
    trigger.focus();

    container = mount(
      <FocusScope restoreFocus>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusScope>
    );

    const first = container.querySelector('button') as HTMLButtonElement;
    first.focus();
    expect(document.activeElement).toBe(first);

    expect(document.activeElement).not.toBe(trigger);
  });

  it('wraps keyboard focus when loop is enabled', () => {
    container = mount(
      <FocusScope loop>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusScope>
    );

    const buttons = Array.from(
      container.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const first = buttons[0];
    const second = buttons[1];

    second.focus();
    second.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    );

    expect(document.activeElement).toBe(first);
  });

  it('keeps focus trapped within scope on focus-out when trapped is enabled', () => {
    const outside = document.createElement('button');
    outside.textContent = 'Outside';
    document.body.appendChild(outside);

    container = mount(
      <FocusScope trapped>
        <button type="button">Inside</button>
      </FocusScope>
    );

    const inside = container.querySelector('button') as HTMLButtonElement;
    inside.focus();

    inside.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: outside,
      })
    );

    expect(document.activeElement).toBe(inside);
  });
});
