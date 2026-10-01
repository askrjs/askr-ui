import { Switch } from '../../../../../src/components/switch/switch';
import {
  captureTimers,
  deterministicRender,
  mount,
  unmount,
} from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('checked native switch', () => (
        <Switch defaultChecked>Airplane mode</Switch>
      )),
      deterministicRender('named native switch', () => (
        <Switch name="power" defaultChecked value="enabled">
          Power
        </Switch>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('disabled asChild switch', () => (
        <Switch asChild disabled>
          <div>Power</div>
        </Switch>
      )),
    ],
  };
}

export function checkedAcrossRemounts(root: HTMLElement) {
  let container = mount(<Switch checked={false}>Power</Switch>, root);
  const first = container.querySelector('button')?.getAttribute('aria-checked');
  unmount(container);

  container = mount(<Switch checked>Power</Switch>, root);
  const second = container
    .querySelector('button')
    ?.getAttribute('aria-checked');

  return { checkedStates: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(<Switch>Power</Switch>, root);
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
