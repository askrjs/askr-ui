import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../../../src/components/progress-circle';
import { PROGRESS_CIRCLE_A11Y_CONTRACT } from '../../../../../src/components/progress-circle/progress-circle.a11y';
import { mount } from '../../_mount';

const ROOT_SELECTOR = `[role="${PROGRESS_CIRCLE_A11Y_CONTRACT.ROLE}"]`;

export function circularMetadata(root: HTMLElement) {
  const container = mount(
    <ProgressCircle value={30} max={60}>
      <ProgressCircleIndicator />
    </ProgressCircle>,
    root
  );

  return {
    valueNow: () =>
      container
        .querySelector(ROOT_SELECTOR)
        ?.getAttribute(PROGRESS_CIRCLE_A11Y_CONTRACT.VALUE_NOW_ATTRIBUTE),
  };
}

export function percentageCustomProperty(root: HTMLElement) {
  const container = mount(
    <ProgressCircle value={30} max={60}>
      <ProgressCircleIndicator />
    </ProgressCircle>,
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

export function asChildIndicatorRefs(root: HTMLElement) {
  const childRef = { current: null as HTMLElement | null };
  const callerRef = { current: null as Element | null };
  mount(
    <ProgressCircle value={25}>
      <ProgressCircleIndicator
        asChild
        ref={(node) => (callerRef.current = node)}
      >
        <span ref={childRef}>25%</span>
      </ProgressCircleIndicator>
    </ProgressCircle>,
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
    <ProgressCircle value={25} style={{ color: 'red', marginTop: '8px' }} />,
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
    <ProgressCircle
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
      const node = container.querySelector('[data-progress-circle="true"]');
      return {
        role: node?.getAttribute('role'),
        min: node?.getAttribute(
          PROGRESS_CIRCLE_A11Y_CONTRACT.VALUE_MIN_ATTRIBUTE
        ),
        max: node?.getAttribute(
          PROGRESS_CIRCLE_A11Y_CONTRACT.VALUE_MAX_ATTRIBUTE
        ),
        now: node?.getAttribute(
          PROGRESS_CIRCLE_A11Y_CONTRACT.VALUE_NOW_ATTRIBUTE
        ),
        text: node?.getAttribute('aria-valuetext'),
      };
    },
  };
}
