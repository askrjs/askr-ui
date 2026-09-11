import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../src/components/hover-card';
import { deterministicRender } from '../../_mount';

export function triggerMarkup() {
  return {
    renders: () => [
      deterministicRender('hover card trigger', () => (
        <HoverCard>
          <HoverCardTrigger>Account preview</HoverCardTrigger>
          <HoverCardContent>Details</HoverCardContent>
        </HoverCard>
      )),
    ],
  };
}
