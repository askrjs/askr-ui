import { Toggle } from '../../../../../src/components/toggle/toggle';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Toggle>Mute</Toggle>, root);
}

export function explicitTypeAndPressed(root: HTMLElement): void {
  mount(
    <Toggle type="submit" pressed>
      Save
    </Toggle>,
    root
  );
}

export function nativePress(root: HTMLElement) {
  const onPress = spy();
  mount(<Toggle onPress={onPress}>Mute</Toggle>, root);
  return { pressCount: () => onPress.count() };
}

export function disabledNative(root: HTMLElement) {
  const onPress = spy();
  mount(
    <Toggle disabled onPress={onPress}>
      Mute
    </Toggle>,
    root
  );
  return { pressCount: () => onPress.count() };
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Toggle asChild pressed data-testid="custom-toggle" data-from-toggle="yes">
      <span data-from-child="yes">Mute</span>
    </Toggle>,
    root
  );
}

export function asChildPress(root: HTMLElement) {
  const onPress = spy();
  mount(
    <Toggle asChild onPress={onPress}>
      <span>Mute</span>
    </Toggle>,
    root
  );
  return { pressCount: () => onPress.count() };
}

export function keyboardActivation(root: HTMLElement) {
  const onNativePress = spy();
  const onChildPress = spy();
  const container = mount(
    <div>
      <Toggle onPress={onNativePress}>Native mute</Toggle>
      <Toggle asChild onPress={onChildPress}>
        <span>Mute</span>
      </Toggle>
    </div>,
    root
  );

  return {
    /**
     * Re-queries and focuses the host after letting the render settle, exactly
     * as the vitest original did: the node is replaced between activations.
     */
    focusFresh: async (selector: string) => {
      await flushUpdates();
      (container.querySelector(selector) as HTMLElement).focus();
    },
    flush: async () => {
      await flushUpdates();
    },
    counts: () => ({
      native: onNativePress.count(),
      asChild: onChildPress.count(),
    }),
  };
}

export function asChildDisabled(root: HTMLElement) {
  const onPress = spy();
  mount(
    <Toggle asChild disabled onPress={onPress}>
      <span>Mute</span>
    </Toggle>,
    root
  );
  return { pressCount: () => onPress.count() };
}

export function refForwarding(root: HTMLElement) {
  let nativeRef: HTMLButtonElement | null = null;
  let childRef: HTMLElement | null = null;

  const first = mount(
    <Toggle ref={(node) => (nativeRef = node)}>Mute</Toggle>,
    root
  );
  const nativeMatches =
    nativeRef === (first.querySelector('button') as HTMLButtonElement | null);

  unmount(first);

  const second = mount(
    <Toggle asChild ref={(node) => (childRef = node as HTMLElement | null)}>
      <span>Mute</span>
    </Toggle>,
    root
  );
  const childMatches =
    childRef ===
    (second.querySelector('[role="button"]') as HTMLElement | null);

  return { refs: () => ({ nativeMatches, childMatches }) };
}
