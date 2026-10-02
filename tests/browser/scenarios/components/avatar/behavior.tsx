import { state } from '@askrjs/askr';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../../src/components/avatar';
import { AVATAR_A11Y_CONTRACT } from '../../../../../src/components/avatar/avatar.a11y';
import { mount } from '../../_mount';

export function fallbackUntilLoad(root: HTMLElement) {
  const container = mount(
    <Avatar>
      <AvatarImage key="image" src="/avatar.png" alt="Jane Doe" />
      <AvatarFallback key="fallback">JD</AvatarFallback>
    </Avatar>,
    root
  );

  return {
    fallbackSelector: () => `[${AVATAR_A11Y_CONTRACT.FALLBACK.marker}="true"]`,
  };
}

export function avatarLoadHandoff(root: HTMLElement) {
  const statuses: string[] = [];
  function Fixture() {
    const src = state('/review-first.gif');
    return (
      <Avatar>
        <AvatarImage
          alt="Review"
          src={src()}
          onLoadingStatusChange={(next) => {
            statuses.push(next);
            if (next === 'loaded' && src() === '/review-first.gif')
              src.set('/review-second.gif');
          }}
        />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    );
  }
  mount(<Fixture />, root);
  return { statuses: () => statuses };
}
