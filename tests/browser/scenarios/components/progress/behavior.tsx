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
