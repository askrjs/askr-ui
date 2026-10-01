import { state } from '@askrjs/askr';
import { Checkbox } from '../../../../../src/components/checkbox/checkbox';
import { flushUpdates, mount, spy } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Checkbox />, root);
}

export function nativePress(root: HTMLElement) {
  const onPress = spy();
  mount(<Checkbox onPress={onPress} />, root);
  return { pressCount: () => onPress.count() };
}

export function uncontrolled(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(
    <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange} />,
    root
  );
  return { calls: () => onCheckedChange.calls };
}

export function controlled(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(<Checkbox checked={false} onCheckedChange={onCheckedChange} />, root);
  return { calls: () => onCheckedChange.calls };
}

export function disabledNative(root: HTMLElement) {
  const onPress = spy();
  mount(<Checkbox disabled onPress={onPress} />, root);
  return { pressCount: () => onPress.count() };
}

export function checkedIndeterminate(root: HTMLElement): void {
  mount(<Checkbox checked indeterminate />, root);
}

export function retainedIndeterminate(root: HTMLElement) {
  let setIndeterminate = (_value: boolean): void => undefined;
  let refNode: HTMLInputElement | null = null;
  const App = () => {
    const indeterminate = state(false);
    setIndeterminate = indeterminate.set;

    return (
      <Checkbox
        indeterminate={indeterminate()}
        ref={(node) => (refNode = node)}
      />
    );
  };

  const container = mount(<App />, root);
  const input = container.querySelector('input') as HTMLInputElement;

  return {
    /** Identity of the original input, the ref, and its live property. */
    snapshot: () => ({
      sameInput: container.querySelector('input') === input,
      refIsInput: refNode === input,
      indeterminate: input.indeterminate,
    }),
    setIndeterminate: async (value: boolean) => {
      setIndeterminate(value);
      await flushUpdates();
    },
  };
}

export function asChildRef(root: HTMLElement) {
  let refNode: HTMLElement | null = null;
  const container = mount(
    <Checkbox asChild ref={(node) => (refNode = node as HTMLElement | null)}>
      <div>Checkbox</div>
    </Checkbox>,
    root
  );
  return {
    refIsHost: () =>
      refNode !== null && refNode === container.querySelector('div'),
  };
}

export function keyboardActivation(root: HTMLElement) {
  const onNativeCheckedChange = spy<[boolean]>();
  const onCheckedChange = spy<[boolean]>();
  mount(
    <div>
      <Checkbox
        data-testid="native-checkbox"
        onCheckedChange={onNativeCheckedChange}
      />
      <Checkbox asChild onCheckedChange={onCheckedChange}>
        <span>Remember me</span>
      </Checkbox>
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
      <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange} />
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

export function cancelledAsChildPress(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  mount(
    <Checkbox
      asChild
      onPress={(event) => event.preventDefault?.()}
      onCheckedChange={onCheckedChange}
    >
      <span>Remember me</span>
    </Checkbox>,
    root
  );
  return { calls: () => onCheckedChange.calls };
}
