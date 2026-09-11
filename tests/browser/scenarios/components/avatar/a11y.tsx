import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../../src/components/avatar';
import { mount } from '../../_mount';

export function axeImageAndFallback(root: HTMLElement): void {
  mount(
    <Avatar>
      <AvatarImage key="image" src="/avatar.png" alt="Jane Doe" />
      <AvatarFallback key="fallback">JD</AvatarFallback>
    </Avatar>,
    root
  );
}
