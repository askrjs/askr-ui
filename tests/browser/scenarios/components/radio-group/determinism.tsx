import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import {
  captureTimers,
  deterministicRender,
  mount,
  unmount,
} from '../../_mount';

export function namedAndUnnamedMarkup() {
  return {
    renders: () => [
      deterministicRender('named radio group', () => (
        <RadioGroup defaultValue="m" name="size">
          <RadioGroupItem value="s">Small</RadioGroupItem>
          <RadioGroupItem value="m">Medium</RadioGroupItem>
        </RadioGroup>
      )),
      deterministicRender('unnamed radio group', () => (
        <RadioGroup defaultValue="left">
          <RadioGroupItem value="left">Left</RadioGroupItem>
        </RadioGroup>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild radio item', () => (
        <RadioGroup defaultValue="left">
          <RadioGroupItem asChild value="left">
            <span>Left</span>
          </RadioGroupItem>
        </RadioGroup>
      )),
    ],
  };
}

function readCheckedState(container: HTMLElement) {
  return {
    checked: Array.from(
      container.querySelectorAll('[data-slot="radio-group-item"]')
    ).map((item) => item.getAttribute('aria-checked')),
    value: container
      .querySelector('input[type="hidden"]')
      ?.getAttribute('value'),
  };
}

export function checkedAcrossRemounts(root: HTMLElement) {
  let container = mount(
    <RadioGroup defaultValue="small" name="size">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
  const first = readCheckedState(container);
  unmount(container);

  container = mount(
    <RadioGroup defaultValue="medium" name="size">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
  const second = readCheckedState(container);

  return { checkedStates: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(
      <RadioGroup defaultValue="medium">
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>,
      root
    );
    return {
      scheduled: () => ({
        timeouts: timers.timeouts(),
        intervals: timers.intervals(),
      }),
    };
  } finally {
    timers.restore();
  }
}
