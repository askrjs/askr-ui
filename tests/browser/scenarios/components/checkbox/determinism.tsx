import { Checkbox } from '../../../../../src/components/checkbox/checkbox';
import {
  captureTimers,
  deterministicRender,
  mount,
  unmount,
} from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native checkbox', () => <Checkbox />),
      deterministicRender('checked disabled named checkbox', () => (
        <Checkbox checked disabled name="terms" value="accepted" />
      )),
    ],
  };
}

export function indeterminateAndAsChildMarkup() {
  return {
    renders: () => [
      deterministicRender('checked indeterminate checkbox', () => (
        <Checkbox checked indeterminate />
      )),
      deterministicRender('asChild checkbox', () => (
        <Checkbox asChild checked>
          <div role="checkbox">Agree</div>
        </Checkbox>
      )),
    ],
  };
}

export function checkedAcrossRemounts(root: HTMLElement) {
  let container = mount(<Checkbox checked={false} />, root);
  const first = container.querySelector('input')?.getAttribute('aria-checked');
  unmount(container);

  container = mount(<Checkbox checked />, root);
  const second = container.querySelector('input')?.getAttribute('aria-checked');

  return { checkedStates: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(<Checkbox checked />, root);
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
