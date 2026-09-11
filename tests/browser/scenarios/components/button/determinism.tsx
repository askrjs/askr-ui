import { Button } from '../../../../../src/components/button/button';
import {
  captureTimers,
  deterministicRender,
  mount,
  spy,
  unmount,
} from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native button', () => <Button>Save</Button>),
      deterministicRender('ghost large button', () => (
        <Button variant="ghost" size="lg">
          Action
        </Button>
      )),
      deterministicRender('disabled submit button', () => (
        <Button disabled type="submit">
          Submit
        </Button>
      )),
    ],
  };
}

export function sizeAndWidthAttributes(root: HTMLElement): void {
  mount(
    <Button size="icon-xs" width="full">
      Open
    </Button>,
    root
  );
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild docs link', () => (
        <Button asChild data-testid="docs-link">
          <a href="/docs">Docs</a>
        </Button>
      )),
    ],
  };
}

export function behaviorAcrossRemounts(root: HTMLElement) {
  const firstPress = spy();
  const secondPress = spy();

  let container = mount(<Button onPress={firstPress}>Save</Button>, root);
  container.querySelector('button')?.click();
  const first = firstPress.count();
  unmount(container);

  container = mount(<Button onPress={secondPress}>Save</Button>, root);
  container.querySelector('button')?.click();
  const second = secondPress.count();

  return { pressCounts: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(<Button>Save</Button>, root);
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
