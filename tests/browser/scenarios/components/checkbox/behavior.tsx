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

export function ariaStateOverrides(root: HTMLElement): void {
  mount(
    <div>
      <Checkbox
        checked={false}
        disabled
        aria-checked="true"
        aria-disabled="false"
        data-testid="native-checkbox"
      />
      <Checkbox
        asChild
        checked={false}
        indeterminate
        disabled
        aria-checked="true"
        aria-disabled="false"
      >
        <div role="checkbox" data-testid="child-checkbox">
          Agree
        </div>
      </Checkbox>
    </div>,
    root
  );
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
  const childRef = { current: null as HTMLDivElement | null };
  const componentRef = { current: null as HTMLDivElement | null };
  const container = mount(
    <Checkbox asChild ref={componentRef}>
      <div ref={childRef}>Checkbox</div>
    </Checkbox>,
    root
  );
  return {
    refChecks: () => ({
      child: childRef.current === container.querySelector('div'),
      component: componentRef.current === container.querySelector('div'),
    }),
  };
}

export function asChildNativeInput(root: HTMLElement) {
  const childRef = { current: null as HTMLInputElement | null };
  const componentRef = { current: null as HTMLInputElement | null };
  const container = mount(
    <form>
      <Checkbox
        asChild
        ref={componentRef}
        checked
        disabled
        required
        indeterminate
        name="outer-terms"
        value="accepted"
      >
        <input ref={childRef} type="checkbox" data-testid="native-as-child" />
      </Checkbox>
    </form>,
    root
  );
  const input = container.querySelector('input') as HTMLInputElement;
  const form = container.querySelector('form') as HTMLFormElement;

  return {
    snapshot: () => ({
      checked: input.checked,
      disabled: input.disabled,
      required: input.required,
      name: input.name,
      value: input.value,
      role: input.getAttribute('role'),
      ariaChecked: input.getAttribute('aria-checked'),
      indeterminate: input.indeterminate,
      formValue: new FormData(form).get('outer-terms'),
      childRefAttached: childRef.current === input,
      componentRefAttached: componentRef.current === input,
    }),
  };
}

export function asChildNativeInputActivation(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  const container = mount(
    <Checkbox asChild onCheckedChange={onCheckedChange}>
      <input type="checkbox" data-testid="native-as-child" />
    </Checkbox>,
    root
  );
  const input = container.querySelector('input') as HTMLInputElement;

  return {
    focus: () => input.focus(),
    checked: () => input.checked,
    ariaChecked: () => input.getAttribute('aria-checked'),
    calls: () => onCheckedChange.calls,
  };
}

export function asChildNativeInputReset(root: HTMLElement) {
  const onCheckedChange = spy<[boolean]>();
  const container = mount(
    <form>
      <Checkbox
        asChild
        defaultChecked={false}
        onCheckedChange={onCheckedChange}
      >
        <input type="checkbox" defaultChecked />
      </Checkbox>
    </form>,
    root
  );
  const input = container.querySelector('input') as HTMLInputElement;
  const form = container.querySelector('form') as HTMLFormElement;

  return {
    reset: async () => {
      form.reset();
      await flushUpdates();
    },
    snapshot: () => ({
      checked: input.checked,
      defaultChecked: input.defaultChecked,
      calls: onCheckedChange.calls,
    }),
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
