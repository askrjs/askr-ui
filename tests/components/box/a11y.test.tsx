import { describe, it } from 'vite-plus/test';
import { Box } from '../../../src/components/primitives/box/box';
import { expectNoAxeViolations } from '../../accessibility';

describe('Box - Accessibility', () => {
  it('should have no automated axe violations given default box', async () => {
    await expectNoAxeViolations(<Box>Content</Box>);
  });
});
