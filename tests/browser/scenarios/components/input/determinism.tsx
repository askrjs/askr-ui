import { DebouncedInput, Input } from '../../../../../src/components/input';
import { captureTimers, deterministicRender, mount } from '../../_mount';

export function nativeMarkup() {
  return {
    renders: () => [
      deterministicRender('native input', () => (
        <Input type="email" placeholder="Email" disabled />
      )),
    ],
  };
}

export function asChildAndDebouncedMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild input', () => (
        <Input asChild>
          <input aria-label="Email" />
        </Input>
      )),
      deterministicRender('debounced input', () => (
        <DebouncedInput aria-label="Search" debounceMs={200} />
      )),
    ],
  };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(
      <DebouncedInput
        aria-label="Search"
        debounceMs={200}
        onDebouncedInput={() => undefined}
      />,
      root
    );
    const scheduled = {
      timeouts: timers.timeouts(),
      intervals: timers.intervals(),
    };
    return { scheduled: () => scheduled };
  } finally {
    timers.restore();
  }
}
