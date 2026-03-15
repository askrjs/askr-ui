import { describe, expect, it } from 'vitest';
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../../../src/components/field/field';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Field - Accessibility', () => {
  it('should have no automated axe violations given composed field control', async () => {
    await expectNoAxeViolations(
      <Field id="email" required>
        <FieldLabel fieldId="email">Email</FieldLabel>
        <FieldControl asChild fieldId="email" required children={<input />} />
        <FieldDescription fieldId="email">Used for login</FieldDescription>
      </Field>
    );
  });

  it('should wire label and descriptions onto the control', () => {
    const container = mount(
      <Field id="email" invalid required>
        <FieldLabel fieldId="email">Email</FieldLabel>
        <FieldControl
          asChild
          fieldId="email"
          invalid
          required
          children={<input />}
        />
        <FieldDescription fieldId="email">Used for login</FieldDescription>
        <FieldError fieldId="email">Required</FieldError>
      </Field>
    );

    try {
      const control = container.querySelector('input');
      expect(control?.getAttribute('aria-describedby')).toBe(
        'email-description email-error'
      );
      expect(control?.getAttribute('aria-invalid')).toBe('true');
      expect(control?.getAttribute('aria-required')).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
