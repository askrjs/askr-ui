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
