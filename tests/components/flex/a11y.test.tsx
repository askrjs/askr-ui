import { describe, it } from 'vite-plus/test';
import { Flex } from '../../../src/components/primitives/flex';
import { expectNoAxeViolations } from '../../accessibility';

describe('Flex - Accessibility', () => {
  it('should have no automated axe violations given flex with children', async () => {
    await expectNoAxeViolations(
      <Flex>
        <span key="one">Item one</span>
        <span key="two">Item two</span>
      </Flex>
    );
  });

  it('should have no automated axe violations given flex with gap and wrap', async () => {
    await expectNoAxeViolations(
      <Flex gap="0.5rem" wrap="wrap">
        Content
      </Flex>
    );
  });
});
