import { describe, it } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../src/components/hover-card';
import { expectNoAxeViolations } from '../../accessibility';

describe('HoverCard - Accessibility', () => {
  it('should have no automated axe violations given interactive content', async () => {
    await expectNoAxeViolations(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Account preview</HoverCardTrigger>
        <HoverCardContent>
          <a href="/account">Open account</a>
        </HoverCardContent>
      </HoverCard>
    );
  });
});
