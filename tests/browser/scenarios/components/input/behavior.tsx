import { state } from '@askrjs/askr';
import { Button } from '../../../../../src/components/button';
import { DebouncedInput, Input } from '../../../../../src/components/input';
import { flushUpdates, mount, unmount } from '../../_mount';

export function nativeDefault(root: HTMLElement): void {
  mount(<Input type="email" placeholder="Email" />, root);
}

export function nativeDisabledReadOnly(root: HTMLElement): void {
  mount(
    <Input disabled readOnly aria-disabled={false} aria-label="locked-input" />,
    root
  );
}

export function asChildComposition(root: HTMLElement): void {
  mount(
    <Input asChild data-testid="custom-input" data-from-input="yes">
      <input aria-label="Email" data-from-child="yes" />
    </Input>,
    root
  );
}

export function asChildDisabled(root: HTMLElement): void {
  mount(
    <Input asChild disabled aria-disabled={false}>
      <input aria-label="Email" />
    </Input>,
    root
  );
}

export function asChildChildDisabled(root: HTMLElement): void {
  mount(
    <Input asChild>
      <input disabled data-testid="already-disabled" />
    </Input>,
    root
  );
}

export function asChildChildRef(root: HTMLElement) {
  const childRef = { current: null as HTMLInputElement | null };
  const inputRef = { current: null as HTMLInputElement | null };
  const container = mount(
    <Input asChild ref={inputRef}>
      <input ref={childRef} />
    </Input>,
    root
  );
  return {
    refChecks: () => ({
      child: childRef.current === container.querySelector('input'),
      component: inputRef.current === container.querySelector('input'),
    }),
  };
}

export function asChildStableRefsOnRerender(root: HTMLElement) {
  const childRefCalls: Array<Element | null> = [];
  const componentRefCalls: Array<Element | null> = [];
  const childRef = (node: Element | null) => {
    childRefCalls.push(node);
  };
  const componentRef = (node: Element | null) => {
    componentRefCalls.push(node);
  };
  function Fixture() {
    const version = state(0);
    return (
      <div>
        <Input asChild ref={componentRef}>
          <input ref={childRef} aria-label="Stable ref input" />
        </Input>
        <Button onPress={() => version.set(version() + 1)}>
          Rerender {version()}
        </Button>
      </div>
    );
  }

  const container = mount(<Fixture />, root);
  const originalInput = container.querySelector('input');
  return {
    rerender: async () => {
      container.querySelector('button')?.click();
      await flushUpdates();
    },
    snapshot: () => ({
      sameInput: container.querySelector('input') === originalInput,
      childRefCalls: childRefCalls.map((node) =>
        node === null ? 'null' : 'host'
      ),
      componentRefCalls: componentRefCalls.map((node) =>
        node === null ? 'null' : 'host'
      ),
    }),
  };
}

export function debouncedDefaultType(root: HTMLElement): void {
  mount(<DebouncedInput aria-label="Search" />, root);
}

export function identityRerender(root: HTMLElement) {
  function InputFixture() {
    const value = state('');
    const version = state(0);
    return (
      <div>
        <Input
          aria-label="Search"
          value={value()}
          onInput={(event) =>
            value.set((event.currentTarget as HTMLInputElement).value)
          }
        />
        <Button onPress={() => version.set(version() + 1)}>
          Rerender {version()}
        </Button>
        <output data-testid="mirror">{value()}</output>
      </div>
    );
  }

  const container = mount(<InputFixture />, root);
  const originalInput = container.querySelector('input');
  return {
    flush: flushUpdates,
    sameInput: () => container.querySelector('input') === originalInput,
    rerender: async () => {
      container.querySelector('button')?.click();
      await flushUpdates();
    },
  };
}

function debouncedFixture(root: HTMLElement, debounceMs: number) {
  const typedValues: string[] = [];
  const committedValues: string[] = [];
  const container = mount(
    <DebouncedInput
      debounceMs={debounceMs}
      onInput={(event) => typedValues.push(event.currentTarget.value)}
      onDebouncedInput={(value) => committedValues.push(value)}
    />,
    root
  );
  const input = container.querySelector('input') as HTMLInputElement;
  return {
    flush: flushUpdates,
    typeValues: (values: string[]) => {
      for (const value of values) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    typedValues: () => typedValues,
    committedValues: () => committedValues,
    unmount: () => unmount(container),
  };
}

export function debouncedValues(root: HTMLElement) {
  return debouncedFixture(root, 200);
}

export function debouncedImmediate(root: HTMLElement) {
  return debouncedFixture(root, 0);
}

export function debouncedUnmount(root: HTMLElement) {
  return debouncedFixture(root, 200);
}
