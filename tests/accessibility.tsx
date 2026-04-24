import axe from 'axe-core';
import { mount, unmount } from './test-utils';

export async function expectNoAxeViolations(target: JSX.Element | HTMLElement) {
  const container = target instanceof HTMLElement ? target : mount(target);

  try {
    const results = await axe.run(container);

    if (results.violations.length > 0) {
      throw new Error(
        `Axe violations found:\n${results.violations
          .map((violation) => `- ${violation.id}: ${violation.description}`)
          .join('\n')}`
      );
    }
  } finally {
    unmount(container);
  }
}
