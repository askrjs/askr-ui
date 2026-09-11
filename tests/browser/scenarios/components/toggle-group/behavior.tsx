import { For, state } from '@askrjs/askr';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { TOGGLE_GROUP_A11Y_CONTRACT } from '../../../../../src/components/toggle-group/toggle-group.a11y';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

/** Port of the old `getToggleByText` helper: an exact, trimmed text match. */
function getToggleByText(container: HTMLElement, text: string): HTMLElement {
  const button = Array.from(
    container.querySelectorAll('[data-slot="toggle-group-item"]')
  ).find((element) => element.textContent?.trim() === text);

  if (!(button instanceof HTMLElement)) {
    throw new Error(`Unable to find toggle item with text "${text}"`);
  }

  return button;
}

function errorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : String(error);
}

export function mountSingleAndMultiple(root: HTMLElement) {
  let thrown: string | null = null;
  try {
    mount(
      <div>
        <ToggleGroup defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" defaultValue={['left']}>
          <ToggleGroupItem value="left">Left multiple</ToggleGroupItem>
        </ToggleGroup>
      </div>,
      root
    );
  } catch (error) {
    thrown = errorMessage(error);
  }

  return { thrown: () => thrown };
}

export function singleSelectionHooks(root: HTMLElement) {
  mount(
    <ToggleGroup defaultValue="left" orientation="vertical">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  return { contract: () => TOGGLE_GROUP_A11Y_CONTRACT };
}

export function uncontrolledSingle(root: HTMLElement) {
  const container = mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
  };
}

export function uncontrolledMultiple(root: HTMLElement) {
  const container = mount(
    <ToggleGroup type="multiple" defaultValue={['left']}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
  };
}

export function nestedItems(root: HTMLElement) {
  const container = mount(
    <ToggleGroup defaultValue="left">
      <div>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </div>
      <div>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </div>
    </ToggleGroup>,
    root
  );

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
  };
}

const computedItems = [
  { value: 'all', label: 'All' },
  { value: 'midge', label: 'Midge' },
];

export function computedArrayItems(root: HTMLElement) {
  function ComputedToggleGroup() {
    return (
      <ToggleGroup defaultValue="all">
        {computedItems.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }

  const container = mount(<ComputedToggleGroup />, root);

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
  };
}

export function forItems(root: HTMLElement) {
  function ForToggleGroup() {
    return (
      <ToggleGroup defaultValue="all">
        <For each={computedItems} by={(item) => item.value}>
          {(item) => (
            <ToggleGroupItem value={item.value}>{item.label}</ToggleGroupItem>
          )}
        </For>
      </ToggleGroup>
    );
  }

  const container = mount(<ForToggleGroup />, root);

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
  };
}

export function itemsOutsideGroup(root: HTMLElement) {
  const items = [{ value: 'all', label: 'All' }];
  let thrown: string | null = null;

  try {
    mount(
      <>
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </>,
      root
    );
  } catch (error) {
    thrown = errorMessage(error);
  }

  return { thrown: () => thrown };
}

export function normalizedValues(root: HTMLElement) {
  const onSingleValueChange = spy<[string]>();
  const onMultipleValueChange = spy<[string[]]>();

  const container = mount(
    <div>
      <ToggleGroup defaultValue="left" onValueChange={onSingleValueChange}>
        <ToggleGroupItem value="left">Single left</ToggleGroupItem>
        <ToggleGroupItem value="right">Single right</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        type="multiple"
        defaultValue={['left']}
        onValueChange={onMultipleValueChange}
      >
        <ToggleGroupItem value="left">Multiple left</ToggleGroupItem>
        <ToggleGroupItem value="right">Multiple right</ToggleGroupItem>
      </ToggleGroup>
    </div>,
    root
  );

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
    singleCalls: () => onSingleValueChange.calls,
    multipleCalls: () => onMultipleValueChange.calls,
  };
}

export function disabledInteraction(root: HTMLElement) {
  const onGroupValueChange = spy();
  const onItemValueChange = spy();

  const container = mount(
    <div>
      <ToggleGroup
        disabled
        defaultValue="left"
        onValueChange={onGroupValueChange}
      >
        <ToggleGroupItem value="left">Group left</ToggleGroupItem>
        <ToggleGroupItem value="right">Group right</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue="right" onValueChange={onItemValueChange}>
        <ToggleGroupItem value="left" disabled>
          Item left
        </ToggleGroupItem>
        <ToggleGroupItem value="right">Item right</ToggleGroupItem>
      </ToggleGroup>
    </div>,
    root
  );

  return {
    disabledFlags: () => ({
      groupRight: (getToggleByText(container, 'Group right') as HTMLButtonElement)
        .disabled,
      itemLeft: (getToggleByText(container, 'Item left') as HTMLButtonElement)
        .disabled,
    }),
    clickDisabled: async () => {
      getToggleByText(container, 'Group right').click();
      getToggleByText(container, 'Item left').click();
      await flushUpdates();
    },
    changeCounts: () => ({
      group: onGroupValueChange.count(),
      item: onItemValueChange.count(),
    }),
  };
}

export function asChildComposition(root: HTMLElement) {
  mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem
        asChild
        value="left"
        data-testid="toggle-item"
        data-from-toggle="yes"
      >
        <span data-from-child="yes">Left</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  return { contract: () => TOGGLE_GROUP_A11Y_CONTRACT };
}

export async function asChildKeyboardToggle(root: HTMLElement) {
  const container = mount(
    <ToggleGroup>
      <ToggleGroupItem asChild value="left">
        <span>Left</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  await flushUpdates();
  await flushUpdates();

  return {
    focusFresh: (text: string) => {
      getToggleByText(container, text).focus();
    },
    flush: async () => {
      await flushUpdates();
    },
  };
}

export function refForwarding(root: HTMLElement) {
  let groupRef: HTMLDivElement | null = null;
  let nativeItemRef: HTMLButtonElement | null = null;
  let childItemRef: HTMLElement | null = null;

  let container = mount(
    <ToggleGroup ref={(node) => (groupRef = node)} defaultValue="left">
      <ToggleGroupItem ref={(node) => (nativeItemRef = node)} value="left">
        Left
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  const group = container.querySelector(
    '[data-slot="toggle-group"]'
  ) as HTMLDivElement | null;
  const nativeItem = getToggleByText(container, 'Left');
  const groupMatches = groupRef === group;
  const nativeMatches = nativeItemRef === nativeItem;

  unmount(container);
  container = mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem
        asChild
        ref={(node) => (childItemRef = node as HTMLElement | null)}
        value="left"
      >
        <span>Left</span>
      </ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  const childMatches = childItemRef === getToggleByText(container, 'Left');

  return { refs: () => ({ groupMatches, nativeMatches, childMatches }) };
}

export function controlledValue(root: HTMLElement) {
  const onValueChange = spy<[string]>();
  const container = mount(
    <ToggleGroup value="left" onValueChange={onValueChange}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );

  return {
    clickToggle: async (text: string) => {
      getToggleByText(container, text).click();
      await flushUpdates();
    },
    changeCalls: () => onValueChange.calls,
  };
}

export function noLoopAtBoundary(root: HTMLElement) {
  const container = mount(
    <ToggleGroup defaultValue="left" orientation="horizontal" loop={false}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );

  return {
    pressArrowFromLeft: async () => {
      const left = getToggleByText(container, 'Left');
      left.focus();
      left.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      );
      await flushUpdates();
    },
  };
}

export function disabledRovingNavigation(root: HTMLElement) {
  const container = mount(
    <ToggleGroup defaultValue="left" orientation="vertical">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="middle" disabled>
        Middle
      </ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );

  return {
    pressArrows: async () => {
      const left = getToggleByText(container, 'Left');
      left.focus();
      left.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      left.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
      await flushUpdates();
    },
  };
}

export async function focusedItemBecomesDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicToggleGroup() {
    disabled = state(false);
    return (
      <ToggleGroup defaultValue="middle" orientation="vertical">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="middle" disabled={disabled()}>
          Middle
        </ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
  }

  const container = mount(<DynamicToggleGroup />, root);
  await flushUpdates();
  await flushUpdates();
  getToggleByText(container, 'Middle').focus();

  return {
    disableMiddle: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

export async function controlledTabStop(root: HTMLElement) {
  let selectRight = (): undefined => undefined;
  function Fixture() {
    const value = state('left');
    selectRight = () => value.set('right');
    return (
      <ToggleGroup value={value()} onValueChange={value.set}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
  }
  mount(<Fixture />, root);
  await flushUpdates();

  return {
    selectRight: async () => {
      selectRight();
      await flushUpdates();
    },
  };
}

export async function rtlArrowNavigation(root: HTMLElement) {
  const container = mount(
    <div dir="rtl">
      <ToggleGroup orientation="horizontal" loop={false} defaultValue="middle">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="middle">Middle</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>,
    root
  );
  await flushUpdates();

  return {
    focusToggle: (text: string) => {
      getToggleByText(container, text).focus();
    },
    flush: async () => {
      await flushUpdates();
    },
  };
}

export async function repeatedArrowPresses(root: HTMLElement) {
  const container = mount(
    <ToggleGroup defaultValue="left">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="middle">Middle</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
    root
  );
  await flushUpdates();

  return {
    focusToggle: (text: string) => {
      getToggleByText(container, text).focus();
    },
    flush: async () => {
      await flushUpdates();
    },
    tabStopText: () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-slot="toggle-group-item"]'
        )
      )
        .find((item) => item.tabIndex === 0)
        ?.textContent?.trim() ?? null,
  };
}
