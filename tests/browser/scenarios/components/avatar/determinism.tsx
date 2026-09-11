import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../../src/components/avatar';
import { deterministicRender } from '../../_mount';

export function avatarMarkup() {
  return {
    renders: () => [
      deterministicRender('avatar with image and fallback', () => (
        <Avatar>
          <AvatarImage key="image" src="/avatar.png" alt="Jane Doe" />
          <AvatarFallback key="fallback">JD</AvatarFallback>
        </Avatar>
      )),
    ],
  };
}
