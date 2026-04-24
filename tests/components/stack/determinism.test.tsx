import { describe, it } from 'vite-plus/test';
import { Stack } from '../../../src/components/primitives/stack/stack';
import { expectDeterministicRender } from '../../determinism';

describe('Stack - Determinism', () => {
  it('should render deterministic stack markup', () => {
    expectDeterministicRender(() => (
      <Stack gap="0.5rem" align="center" wrap="wrap">
        <span>Item</span>
      </Stack>
    ));
    expectDeterministicRender(() => <Stack collapseBelow="sm" />);
  });
});