import { describe, it } from 'vite-plus/test';
import { Flex } from '../../../src/components/primitives/flex/flex';
import { expectNoAxeViolations } from '../../accessibility';

describe('Flex - Accessibility', () => {
  it('should have no automated axe violations given flex with children', async () => {
    await expectNoAxeViolations(
      <Flex>
        <span>Item one</span>
        <span>Item two</span>
      </Flex>
    );
  });

  it('should have no automated axe violations given flex column with gap and align', async () => {
    await expectNoAxeViolations(
      <Flex direction="column" gap="1rem" align="center">
        Content
      </Flex>
    );
  });
});
