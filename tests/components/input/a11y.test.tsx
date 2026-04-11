import { describe, expect, it } from 'vite-plus/test';
import { Input } from '../../../src/components/primitives/input/input';
import { INPUT_A11Y_CONTRACT } from '../../../src/components/primitives/input/input.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Input - Accessibility', () => {
  it('has no automated axe violations for a labelled native input', async () => {
    await expectNoAxeViolations(<Input aria-label="Email" type="email" />);
  });

  it('has no automated axe violations for a labelled asChild input', async () => {
    await expectNoAxeViolations(
      <Input asChild>
        <input aria-label="Email" type="email" />
      </Input>
    );
  });

  it('uses native disabled semantics for the default host', () => {
    const container = mount(<Input aria-label="Email" disabled />);

    try {
      const input = container.querySelector('input') as HTMLInputElement | null;

      expect(input?.disabled).toBe(true);
      expect(
        input?.getAttribute(INPUT_A11Y_CONTRACT.DISABLED_ATTRIBUTES.asChild)
      ).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('uses aria-disabled and removes disabled asChild hosts from tab order', () => {
    const container = mount(
      <Input asChild disabled>
        <div role="textbox">Custom input</div>
      </Input>
    );

    try {
      const host = container.querySelector('[role="textbox"]');

      expect(
        host?.getAttribute(INPUT_A11Y_CONTRACT.DISABLED_ATTRIBUTES.asChild)
      ).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented input accessibility contract', () => {
    expect(INPUT_A11Y_CONTRACT.HOST_ELEMENT).toBe('input');
    expect(INPUT_A11Y_CONTRACT.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'aria-disabled',
    });
    expect(INPUT_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      disabled: 'data-disabled',
    });
    expect(INPUT_A11Y_CONTRACT.FOCUS_RULES).toEqual({
      defaultTabIndex: 0,
      disabledTabIndex: -1,
    });
    expect(INPUT_A11Y_CONTRACT.LABELING).toEqual({
      supportsLabelElement: true,
      supportsAriaLabel: true,
      supportsAriaLabelledBy: true,
    });
  });
});
