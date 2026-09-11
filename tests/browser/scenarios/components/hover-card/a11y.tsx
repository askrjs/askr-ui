import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../src/components/hover-card';
import { mount } from '../../_mount';

export function axeInteractiveContent(root: HTMLElement): void {
  mount(
    <HoverCard defaultOpen>
      <HoverCardTrigger>Account preview</HoverCardTrigger>
      <HoverCardContent>
        <a href="/account">Open account</a>
      </HoverCardContent>
    </HoverCard>,
    root
  );
}
