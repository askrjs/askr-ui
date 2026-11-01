import { Switch } from '../../../../../src/components/switch/switch';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Switch>Airplane mode</Switch>, root);
}

export function explicitTypeAndChecked(root: HTMLElement): void {
  mount(
    <Switch type="submit" checked>
      Publish
    </Switch>,
    root
  );
}

export function uncontrolled(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(
    <Switch defaultChecked={false} onCheckedChange={onCheckedChange}>
      Airplane mode
    </Switch>,
    root
  );
  return { calls: () => onCheckedChange.calls };
}

export function controlled(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(
    <Switch checked={false} onCheckedChange={onCheckedChange}>
      Power
    </Switch>,
    root
  );
  return { calls: () => onCheckedChange.calls };
}

export function namedHiddenInput(root: HTMLElement): void {
  mount(
    <Switch name="notifications" defaultChecked value="enabled">
      Notifications
    </Switch>,
    root
  );
}

export function hiddenInputSync(root: HTMLElement): void {
  mount(
    <Switch name="notifications" defaultChecked={false}>
      Notifications
    </Switch>,
    root
  );
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Switch
      asChild
      defaultChecked
      data-testid="power-switch"
      data-from-switch="yes"
    >
      <div data-from-child="yes">Power</div>
    </Switch>,
    root
  );
}

export function keyboardActivation(root: HTMLElement) {
  const onNativeCheckedChange = spy<[boolean]>();
  const onCheckedChange = spy<[boolean]>();
  mount(
    <div>
      <Switch
        data-testid="native-switch"
        onCheckedChange={onNativeCheckedChange}
      >
        Native power
      </Switch>
      <Switch asChild onCheckedChange={onCheckedChange}>
        <span>Power</span>
      </Switch>
    </div>,
    root
  );
  return {
    nativeCalls: () => onNativeCheckedChange.calls,
    childCalls: () => onCheckedChange.calls,
  };
}

export function formReset(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  const container = mount(
    <form>
      <Switch defaultChecked={false} onCheckedChange={onCheckedChange}>
        Power
      </Switch>
    </form>,
    root
  );
  return {
    reset: async () => {
      (container.querySelector('form') as HTMLFormElement).reset();
      await flushUpdates();
    },
    calls: () => onCheckedChange.calls,
  };
}

export function disabledAsChild(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(
    <Switch asChild disabled onCheckedChange={onCheckedChange}>
      <div>Power</div>
    </Switch>,
    root
  );
  return { calls: () => onCheckedChange.calls };
}

export function disabledNative(root: HTMLElement): void {
  mount(
    <Switch disabled type="submit">
      Publish
    </Switch>,
    root
  );
}

export function semanticOverrides(root: HTMLElement): void {
  mount(
    <Switch defaultChecked role="button" aria-checked="false">
      Power
    </Switch>,
    root
  );
}

export function externalFormAssociation(root: HTMLElement): void {
  mount(
    <div>
      <form id="external-switch-form" />
      <Switch
        form="external-switch-form"
        name="power"
        value="enabled"
        defaultChecked
      >
        Power
      </Switch>
    </div>,
    root
  );
}

export function forwardedRefs(root: HTMLElement) {
  let nativeRef: HTMLButtonElement | null = null;
  let asChildRef: HTMLElement | null = null;
  let childPropRef: HTMLElement | null = null;

  let container = mount(
    <Switch ref={(node) => (nativeRef = node)}>Power</Switch>,
    root
  );
  const button = container.querySelector('button');
  const nativeMatches = nativeRef !== null && nativeRef === button;

  unmount(container);
  container = mount(
    <Switch asChild ref={(node) => (asChildRef = node as HTMLElement | null)}>
      <div ref={(node) => (childPropRef = node)}>Power</div>
    </Switch>,
    root
  );
  const host = container.querySelector('[role="switch"]');
  const componentRefMatches = asChildRef !== null && asChildRef === host;
  const childPropMatches = childPropRef !== null && childPropRef === host;

  return {
    refs: () => ({ nativeMatches, componentRefMatches, childPropMatches }),
  };
}
