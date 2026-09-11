import { Toggle } from '../../../../../src/components/toggle/toggle';
import {
  captureTimers,
  deterministicRender,
  mount,
  unmount,
} from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native toggle', () => <Toggle>Mute</Toggle>),
      deterministicRender('pressed submit toggle', () => (
        <Toggle pressed type="submit">
          Save
        </Toggle>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild toggle', () => (
        <Toggle asChild pressed>
          <span>Mute</span>
        </Toggle>
      )),
    ],
  };
}

export function pressedAcrossRemounts(root: HTMLElement) {
  let container = mount(<Toggle pressed={false}>Mute</Toggle>, root);
  const first = container.querySelector('button')?.getAttribute('aria-pressed');
  unmount(container);

  container = mount(<Toggle pressed>Mute</Toggle>, root);
  const second = container
    .querySelector('button')
    ?.getAttribute('aria-pressed');

  return { pressedStates: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(<Toggle>Mute</Toggle>, root);
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
