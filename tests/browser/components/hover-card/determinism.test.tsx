import { describe, it } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import { expectDeterministicRender } from '../../determinism';

describe('HoverCard - Determinism', () => {
  it('should render deterministic trigger markup without scheduling timers', () => {
    expectDeterministicRender(() => (
      <HoverCard>
        <HoverCardTrigger>Account preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    ));
  });
});
