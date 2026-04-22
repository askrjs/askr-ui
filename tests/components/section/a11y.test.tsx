import { describe, it } from 'vite-plus/test';
import { Section } from '../../../src/components/primitives/section/section';
import { expectNoAxeViolations } from '../../accessibility';

describe('Section - Accessibility', () => {
  it('should have no automated axe violations given default section', async () => {
    await expectNoAxeViolations(<Section>Content</Section>);
  });
});
