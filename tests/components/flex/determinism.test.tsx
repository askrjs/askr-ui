import { describe, it } from 'vite-plus/test';
import { Flex } from '../../../src/components/primitives/flex';
import { expectDeterministicRender } from '../../determinism';

describe('Flex - Determinism', () => {
  it('should render deterministic flex markup', () => {
    expectDeterministicRender(() => (
      <Flex gap="0.5rem" align="center" wrap="wrap">
        <span>Item</span>
      </Flex>
    ));
    expectDeterministicRender(() => <Flex collapseBelow="sm" />);
  });
});
