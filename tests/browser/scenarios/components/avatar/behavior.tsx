import { state } from '@askrjs/askr';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../../src/components/avatar';
import { AVATAR_A11Y_CONTRACT } from '../../../../../src/components/avatar/avatar.a11y';
import { flushUpdates, mount } from '../../_mount';

export function fallbackUntilLoad(root: HTMLElement) {
  mount(
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

export function fallbackAfterImageRemoval(root: HTMLElement) {
  let showImage!: ReturnType<typeof state<boolean>>;
  function Fixture() {
    showImage = state(true);
    return (
      <Avatar>
        {showImage() ? (
          <AvatarImage
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            alt="Jane Doe"
          />
        ) : null}
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
  }
  const container = mount(<Fixture />, root);
  return {
    loadAndRemove: async () => {
      await flushUpdates();
      container.querySelector('img')?.dispatchEvent(new Event('load'));
      await flushUpdates();
      showImage.set(false);
      await flushUpdates();
    },
  };
}

export function asChildRefs(root: HTMLElement) {
  const avatarRef = { current: null as HTMLDivElement | null };
  const avatarComponentRef = { current: null as HTMLDivElement | null };
  const fallbackRef = { current: null as HTMLSpanElement | null };
  const fallbackComponentRef = { current: null as HTMLSpanElement | null };
  const container = mount(
    <Avatar asChild ref={avatarComponentRef}>
      <div ref={avatarRef}>
        <AvatarFallback asChild ref={fallbackComponentRef}>
          <span ref={fallbackRef}>JD</span>
        </AvatarFallback>
      </div>
    </Avatar>,
    root
  );
  return {
    refChecks: () => ({
      avatarChild: avatarRef.current === container.querySelector('div'),
      avatarComponent:
        avatarComponentRef.current === container.querySelector('div'),
      fallbackChild: fallbackRef.current === container.querySelector('span'),
      fallbackComponent:
        fallbackComponentRef.current === container.querySelector('span'),
    }),
  };
}
