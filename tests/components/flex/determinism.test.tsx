import { describe, it } from 'vite-plus/test';
import { Flex } from '../../../src/components/primitives/flex/flex';
import { expectDeterministicRender } from '../../determinism';

describe('Flex - Determinism', () => {
  it('should render deterministic flex markup', () => {
    expectDeterministicRender(() => (
      <Flex gap="1rem" align="center">
        <span>Item</span>
      </Flex>
    ));
    expectDeterministicRender(() => (
      <Flex direction="column" justify="space-between" wrap="wrap" />
    ));
  });
});
