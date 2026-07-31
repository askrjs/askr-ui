import { describe, it } from 'vite-plus/test';
import { Form } from '../../../../src/components/form';
import { expectNoAxeViolations } from '../../accessibility';

describe('Form - Accessibility', () => {
  it('should have no automated axe violations given labelled controls', async () => {
    await expectNoAxeViolations(
      <Form>
        <label for="account-name">Name</label>
        <input id="account-name" />
        <button type="submit">Save</button>
      </Form>
    );
  });
});
