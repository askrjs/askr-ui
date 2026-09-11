import { FocusScope } from '../../../../../src/components/focus-scope';
import { mount } from '../../_mount';

export function manualFocusInsideScope(root: HTMLElement) {
  const trigger = document.createElement('button');
  trigger.textContent = 'Before';
  document.body.appendChild(trigger);
  trigger.focus();

  const container = mount(
    <FocusScope restoreFocus>
      <button type="button">First</button>
      <button type="button">Second</button>
    </FocusScope>,
    root
  );

  const first = container.querySelector('button') as HTMLButtonElement;
  first.focus();

  const focusedFirst = document.activeElement === first;
  const focusedTrigger = document.activeElement === trigger;

  trigger.remove();

  return { focus: () => ({ focusedFirst, focusedTrigger }) };
}

export function loopWrapsFocus(root: HTMLElement) {
  const container = mount(
    <FocusScope loop>
      <button type="button">First</button>
      <button type="button">Second</button>
    </FocusScope>,
    root
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

  const focusedFirst = document.activeElement === first;

  return { focusedFirst: () => focusedFirst };
}

export function trappedFocusOut(root: HTMLElement) {
  const outside = document.createElement('button');
  outside.textContent = 'Outside';
  document.body.appendChild(outside);

  const container = mount(
    <FocusScope trapped>
      <button type="button">Inside</button>
    </FocusScope>,
    root
  );

  const inside = container.querySelector('button') as HTMLButtonElement;
  inside.focus();

  inside.dispatchEvent(
    new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: outside,
    })
  );

  const focusedInside = document.activeElement === inside;

  outside.remove();

  return { focusedInside: () => focusedInside };
}
