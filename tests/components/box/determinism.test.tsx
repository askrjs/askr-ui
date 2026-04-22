import { describe, it } from 'vite-plus/test';
import { Box } from '../../../src/components/primitives/box/box';
import { expectDeterministicRender } from '../../determinism';

describe('Box - Determinism', () => {
  it('should render deterministic box markup', () => {
    expectDeterministicRender(() => (
      <Box p={{ initial: '2', md: '4' }} width="20rem">
        Content
      </Box>
    ));
  });
});
