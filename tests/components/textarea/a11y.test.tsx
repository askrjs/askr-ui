import { describe, expect, it } from 'vite-plus/test';
import { Textarea } from '../../../src/components/primitives/textarea/textarea';
import { TEXTAREA_A11Y_CONTRACT } from '../../../src/components/primitives/textarea/textarea.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Textarea - Accessibility', () => {
  it('has no automated axe violations for a labelled native textarea', async () => {
    await expectNoAxeViolations(<Textarea aria-label="Notes" rows={3} />);
  });

  it('has no automated axe violations for a labelled asChild textarea', async () => {
    await expectNoAxeViolations(
      <Textarea asChild>
        <textarea aria-label="Notes" rows={3} />
      </Textarea>
    );
  });

  it('uses native disabled semantics for the default host', () => {
    const container = mount(<Textarea aria-label="Notes" disabled />);

    try {
      const textarea = container.querySelector(
        'textarea'
      ) as HTMLTextAreaElement | null;

      expect(textarea?.disabled).toBe(true);
      expect(
        textarea?.getAttribute(
          TEXTAREA_A11Y_CONTRACT.DISABLED_ATTRIBUTES.asChild
        )
      ).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('uses aria-disabled and removes disabled asChild hosts from tab order', () => {
    const container = mount(
      <Textarea asChild disabled>
        <div role="textbox">Notes</div>
      </Textarea>
    );

    try {
      const host = container.querySelector('[role="textbox"]');

      expect(
        host?.getAttribute(TEXTAREA_A11Y_CONTRACT.DISABLED_ATTRIBUTES.asChild)
      ).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented textarea accessibility contract', () => {
    expect(TEXTAREA_A11Y_CONTRACT.HOST_ELEMENT).toBe('textarea');
    expect(TEXTAREA_A11Y_CONTRACT.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'aria-disabled',
    });
    expect(TEXTAREA_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      disabled: 'data-disabled',
    });
    expect(TEXTAREA_A11Y_CONTRACT.FOCUS_RULES).toEqual({
      defaultTabIndex: 0,
      disabledTabIndex: -1,
    });
    expect(TEXTAREA_A11Y_CONTRACT.LABELING).toEqual({
      supportsLabelElement: true,
      supportsAriaLabel: true,
      supportsAriaLabelledBy: true,
    });
  });
});
