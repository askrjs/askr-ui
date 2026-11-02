import {
  Progress,
  ProgressIndicator,
} from '../../../../../src/components/progress';
import { PROGRESS_A11Y_CONTRACT } from '../../../../../src/components/progress/progress.a11y';
import { mount } from '../../_mount';

const ROOT_SELECTOR = `[role="${PROGRESS_A11Y_CONTRACT.ROLE}"]`;
const INDICATOR_SELECTOR = `[${PROGRESS_A11Y_CONTRACT.INDICATOR_MARKER}="true"]`;

export function progressMetadata(root: HTMLElement) {
  const container = mount(
    <Progress value={40} max={80}>
      <ProgressIndicator />
    </Progress>,
    root
  );

  return {
    metadata: () => ({
      valueNow: container
        .querySelector(ROOT_SELECTOR)
        ?.getAttribute(PROGRESS_A11Y_CONTRACT.VALUE_NOW_ATTRIBUTE),
      indicatorPercentage: container
        .querySelector(INDICATOR_SELECTOR)
        ?.getAttribute(PROGRESS_A11Y_CONTRACT.INDICATOR_PERCENTAGE_ATTRIBUTE),
    }),
  };
}

export function percentageCustomProperty(root: HTMLElement) {
  const container = mount(
    <Progress value={40} max={80}>
      <ProgressIndicator />
    </Progress>,
    root
  );

  return {
    styling: () => {
      const node = container.querySelector(ROOT_SELECTOR) as HTMLElement;
      return {
        styleAttribute: node.getAttribute('style'),
        percentage: getComputedStyle(node)
          .getPropertyValue('--ak-progress-percentage')
          .trim(),
      };
    },
  };
}

const NON_FINITE_MAX: Record<string, number> = {
  positiveInfinity: Number.POSITIVE_INFINITY,
  negativeInfinity: Number.NEGATIVE_INFINITY,
  nan: Number.NaN,
};

export function nonFiniteMax(root: HTMLElement, options: { key: string }) {
  const container = mount(
    <Progress value={40} max={NON_FINITE_MAX[options.key]} />,
    root
  );

  return {
    valueMax: () =>
      container
        .querySelector(ROOT_SELECTOR)
        ?.getAttribute(PROGRESS_A11Y_CONTRACT.VALUE_MAX_ATTRIBUTE),
  };
}

export function asChildIndicatorRefs(root: HTMLElement) {
  const childRef = { current: null as HTMLElement | null };
  const callerRef = { current: null as Element | null };
  mount(
    <Progress value={25}>
      <ProgressIndicator asChild ref={(node) => (callerRef.current = node)}>
        <span ref={childRef}>25%</span>
      </ProgressIndicator>
    </Progress>,
    root
  );
  return {
    refsAttached: () => ({
      child: childRef.current !== null,
      caller: callerRef.current !== null,
    }),
  };
}

export function callerStyle(root: HTMLElement) {
  const container = mount(
    <Progress value={25} style={{ color: 'red', marginTop: '8px' }} />,
    root
  );
  return {
    style: () => {
      const node = container.querySelector(ROOT_SELECTOR) as HTMLElement;
      return { color: node.style.color, marginTop: node.style.marginTop };
    },
  };
}

export function stateAriaOverrides(root: HTMLElement) {
  const container = mount(
    <Progress
      value={25}
      max={50}
      role="status"
      aria-valuemin="10"
      aria-valuemax="90"
      aria-valuenow="65"
      aria-valuetext="Caller label"
    />,
    root
  );
  return {
    metadata: () => {
      const node = container.querySelector('[data-progress="true"]');
      return {
        role: node?.getAttribute('role'),
        min: node?.getAttribute(PROGRESS_A11Y_CONTRACT.VALUE_MIN_ATTRIBUTE),
        max: node?.getAttribute(PROGRESS_A11Y_CONTRACT.VALUE_MAX_ATTRIBUTE),
        now: node?.getAttribute(PROGRESS_A11Y_CONTRACT.VALUE_NOW_ATTRIBUTE),
        text: node?.getAttribute('aria-valuetext'),
      };
    },
  };
}
