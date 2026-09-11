import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import {
  captureTimers,
  deterministicRender,
  mount,
  unmount,
} from '../../_mount';

export function groupMarkup() {
  return {
    renders: () => [
      deterministicRender('single toggle group', () => (
        <ToggleGroup defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
        </ToggleGroup>
      )),
      deterministicRender('multiple toggle group', () => (
        <ToggleGroup type="multiple" defaultValue={['left']}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      )),
    ],
  };
}

export function asChildMarkup() {
  return {
    renders: () => [
      deterministicRender('asChild toggle group item', () => (
        <ToggleGroup defaultValue="left">
          <ToggleGroupItem asChild value="left">
            <span>Left</span>
          </ToggleGroupItem>
        </ToggleGroup>
      )),
    ],
  };
}

function pressedStates(container: HTMLElement): (string | null)[] {
  return Array.from(
    container.querySelectorAll('[data-slot="toggle-group-item"]')
  ).map((item) => item.getAttribute('aria-pressed'));
}

export function selectionAcrossRemounts(root: HTMLElement) {
  let container = mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  const first = pressedStates(container);
  unmount(container);

  container = mount(
    <ToggleGroup defaultValue="right">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  const second = pressedStates(container);

  return { pressedStates: () => ({ first, second }) };
}

export function timersDuringRender(root: HTMLElement) {
  const timers = captureTimers();
  try {
    mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </ToggleGroup>,
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
