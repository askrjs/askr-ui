import { state } from '@askrjs/askr';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import { RADIO_GROUP_A11Y_CONTRACT } from '../../../../../src/components/radio-group/radio-group.a11y';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function uncontrolledHooks(root: HTMLElement) {
  mount(
    <RadioGroup defaultValue="medium" orientation="horizontal">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
  return { contract: () => RADIO_GROUP_A11Y_CONTRACT };
}

export function uncontrolledNamed(root: HTMLElement): void {
  mount(
    <RadioGroup name="size" defaultValue="small">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function nestedItems(root: HTMLElement) {
  const changes: string[] = [];
  mount(
    <RadioGroup
      name="size"
      defaultValue="small"
      onValueChange={(value) => changes.push(value)}
    >
      <div>
        <RadioGroupItem value="small">Small</RadioGroupItem>
      </div>
      <div>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </div>
    </RadioGroup>,
    root
  );
  return {
    itemCount: () =>
      root.querySelectorAll('[data-slot="radio-group-item"]').length,
    changes: () => changes,
  };
}

export function controlled(root: HTMLElement) {
  const onValueChange = spy<[string]>();
  mount(
    <RadioGroup value="small" onValueChange={onValueChange}>
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
  return { calls: () => onValueChange.calls };
}

export function disabledGroupAndItem(root: HTMLElement) {
  const onGroupValueChange = spy<[string]>();
  const onItemValueChange = spy<[string]>();
  mount(
    <div>
      <RadioGroup
        disabled
        defaultValue="small"
        onValueChange={onGroupValueChange}
      >
        <RadioGroupItem value="small">Group small</RadioGroupItem>
        <RadioGroupItem value="medium">Group medium</RadioGroupItem>
      </RadioGroup>
      <RadioGroup defaultValue="medium" onValueChange={onItemValueChange}>
        <RadioGroupItem value="small" disabled>
          Item small
        </RadioGroupItem>
        <RadioGroupItem value="medium">Item medium</RadioGroupItem>
      </RadioGroup>
    </div>,
    root
  );
  return {
    groupCalls: () => onGroupValueChange.calls,
    itemCalls: () => onItemValueChange.calls,
  };
}

export function asChildComposition(root: HTMLElement) {
  mount(
    <RadioGroup defaultValue="left">
      <RadioGroupItem
        asChild
        value="left"
        data-testid="radio-item"
        data-from-radio="yes"
      >
        <span data-from-child="yes">Left</span>
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
  return { contract: () => RADIO_GROUP_A11Y_CONTRACT };
}

export function keyboardActivation(root: HTMLElement): void {
  mount(
    <RadioGroup defaultValue="small">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem asChild value="medium">
        <span>Medium</span>
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function formReset(root: HTMLElement) {
  const onValueChange = spy<[string]>();
  const container = mount(
    <form>
      <RadioGroup
        defaultValue="small"
        name="size"
        onValueChange={onValueChange}
      >
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    </form>,
    root
  );
  return {
    reset: async () => {
      (container.querySelector('form') as HTMLFormElement).reset();
      await flushUpdates();
    },
    calls: () => onValueChange.calls,
  };
}

export function forwardedRefs(root: HTMLElement) {
  let groupRef: HTMLDivElement | null = null;
  let nativeItemRef: HTMLButtonElement | null = null;
  let childItemRef: HTMLElement | null = null;

  const first = mount(
    <RadioGroup ref={(node) => (groupRef = node)} defaultValue="left">
      <RadioGroupItem ref={(node) => (nativeItemRef = node)} value="left">
        Left
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
  const groupMatches =
    groupRef !== null &&
    groupRef === first.querySelector('[data-slot="radio-group"]');
  const nativeItemMatches =
    nativeItemRef !== null &&
    nativeItemRef === first.querySelector('[data-slot="radio-group-item"]');
  unmount(first);

  const second = mount(
    <RadioGroup defaultValue="left">
      <RadioGroupItem
        asChild
        ref={(node) => (childItemRef = node as HTMLElement | null)}
        value="left"
      >
        <span>Left</span>
      </RadioGroupItem>
    </RadioGroup>,
    root
  );
  const childItemMatches =
    childItemRef !== null &&
    childItemRef === second.querySelector('[data-slot="radio-group-item"]');

  return {
    refs: () => ({ groupMatches, nativeItemMatches, childItemMatches }),
  };
}

export function namedAndUnnamed(root: HTMLElement): void {
  mount(
    <div>
      <RadioGroup defaultValue="small">
        <RadioGroupItem value="small">Unnamed small</RadioGroupItem>
      </RadioGroup>
      <RadioGroup name="named-size" defaultValue="medium">
        <RadioGroupItem value="medium">Named medium</RadioGroupItem>
      </RadioGroup>
    </div>,
    root
  );
}

export function noLoop(root: HTMLElement): void {
  mount(
    <RadioGroup defaultValue="small" orientation="horizontal" loop={false}>
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium">Medium</RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function disabledMiddle(root: HTMLElement): void {
  mount(
    <RadioGroup defaultValue="small" orientation="vertical">
      <RadioGroupItem value="small">Small</RadioGroupItem>
      <RadioGroupItem value="medium" disabled>
        Medium
      </RadioGroupItem>
      <RadioGroupItem value="large">Large</RadioGroupItem>
    </RadioGroup>,
    root
  );
}

export function siblingGroups(root: HTMLElement) {
  const container = mount(
    <div>
      <RadioGroup defaultValue="small" orientation="vertical">
        <RadioGroupItem value="small">Small A</RadioGroupItem>
        <RadioGroupItem value="medium">Medium A</RadioGroupItem>
      </RadioGroup>
      <RadioGroup defaultValue="small" orientation="vertical">
        <RadioGroupItem value="small">Small A</RadioGroupItem>
        <RadioGroupItem value="medium">Medium A</RadioGroupItem>
      </RadioGroup>
    </div>,
    root
  );
  const idsOf = (group: Element | undefined) =>
    Array.from(
      group?.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]') ??
        []
    ).map((item) => item.id);
  return {
    ids: () => {
      const groups = container.querySelectorAll('[data-slot="radio-group"]');
      return { first: idsOf(groups[0]), second: idsOf(groups[1]) };
    },
  };
}

export function focusRepair(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicRadioGroup() {
    disabled = state(false);
    return (
      <RadioGroup defaultValue="medium" orientation="vertical">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium" disabled={disabled()}>
          Medium
        </RadioGroupItem>
        <RadioGroupItem value="large">Large</RadioGroupItem>
      </RadioGroup>
    );
  }

  mount(<DynamicRadioGroup />, root);
  return {
    disable: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

export function allDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function AllDisabledRadioGroup() {
    disabled = state(false);
    return (
      <RadioGroup defaultValue="only">
        <RadioGroupItem value="only" disabled={disabled()}>
          Only
        </RadioGroupItem>
      </RadioGroup>
    );
  }

  mount(<AllDisabledRadioGroup />, root);
  return {
    disable: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
    /** Whether the active element is a disabled element. */
    activeIsDisabled: () =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement.hasAttribute('disabled'),
  };
}

export function rtl(root: HTMLElement): void {
  mount(
    <div dir="rtl">
      <RadioGroup orientation="horizontal" defaultValue="middle">
        <RadioGroupItem value="left">Left</RadioGroupItem>
        <RadioGroupItem value="middle">Middle</RadioGroupItem>
        <RadioGroupItem value="right">Right</RadioGroupItem>
      </RadioGroup>
    </div>,
    root
  );
}
