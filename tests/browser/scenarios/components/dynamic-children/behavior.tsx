import type { JSX } from '@askrjs/askr/jsx-runtime';
import { state } from '@askrjs/askr';
import { For } from '@askrjs/askr/control';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../src/components/accordion';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../../src/components/slider';
import { flushUpdates, mount, unmount } from '../../_mount';

const ITEMS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
] as const;

type DynamicMode = 'map' | 'for';

function DynamicItems<T>(props: {
  mode: DynamicMode;
  each: readonly T[];
  by: (item: T, index: number) => string | number;
  children: (item: T) => JSX.Element;
}) {
  return props.mode === 'map' ? (
    props.each.map(props.children)
  ) : (
    <For each={props.each} by={props.by}>
      {props.children}
    </For>
  );
}

function modes() {
  return ['map', 'for'] as const;
}

async function flushTimes(count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) await flushUpdates();
}

function bodyMenuItemTexts(): Array<string | undefined> {
  return Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
    (node) => node.textContent?.trim()
  );
}

export function accordionItems(root: HTMLElement) {
  mount(
    <div>
      {modes().map((mode) => (
        <Accordion key={mode} defaultValue="one">
          <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
            {(item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionHeader>
                  <AccordionTrigger>
                    {item.label} {mode}
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent>{item.label} content</AccordionContent>
              </AccordionItem>
            )}
          </DynamicItems>
        </Accordion>
      ))}
    </div>,
    root
  );
}

export function radioGroupItems(root: HTMLElement) {
  mount(
    <div>
      {modes().map((mode) => (
        <RadioGroup key={mode} defaultValue="one">
          <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
            {(item) => (
              <RadioGroupItem key={item.value} value={item.value}>
                {item.label} {mode}
              </RadioGroupItem>
            )}
          </DynamicItems>
        </RadioGroup>
      ))}
    </div>,
    root
  );
}

export function menuItems(root: HTMLElement) {
  mount(
    <div>
      {modes().map((mode) => (
        <Menu key={mode}>
          <MenuContent>
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <MenuItem key={item.value}>
                  {item.label} {mode}
                </MenuItem>
              )}
            </DynamicItems>
          </MenuContent>
        </Menu>
      ))}
    </div>,
    root
  );
}

export async function dropdownItems(root: HTMLElement) {
  mount(
    <div>
      {modes().map((mode) => (
        <Dropdown key={mode} defaultOpen>
          <DropdownTrigger>Open {mode}</DropdownTrigger>
          <DropdownContent forceMount>
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <DropdownItem key={item.value}>
                  {item.label} {mode}
                </DropdownItem>
              )}
            </DynamicItems>
          </DropdownContent>
        </Dropdown>
      ))}
    </div>,
    root
  );
  await flushUpdates();
}

export function selectItems(root: HTMLElement) {
  const container = mount(
    <div>
      {modes().map((mode) => (
        <Select key={mode} defaultValue="one" name={mode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent forceMount>
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  textValue={`${item.label} ${mode}`}
                >
                  {item.label} {mode}
                </SelectItem>
              )}
            </DynamicItems>
          </SelectContent>
        </Select>
      ))}
    </div>,
    root
  );

  return {
    /** Programmatic clicks, as the vitest original used (content is forceMounted closed). */
    clickTwoOptions: async () => {
      for (const mode of modes()) {
        const item = Array.from(
          container.querySelectorAll('[role="option"]')
        ).find((option) => option.textContent?.trim() === `Two ${mode}`);
        (item as HTMLElement | undefined)?.click();
      }
      await flushUpdates();
    },
  };
}

export function menubarMenusAndItems(root: HTMLElement) {
  const container = mount(
    <div>
      {modes().map((mode) => (
        <Menubar key={mode}>
          <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
            {(menu) => (
              <MenubarMenu key={menu.value} value={menu.value}>
                <MenubarTrigger>
                  {menu.label} {mode}
                </MenubarTrigger>
                <MenubarPortal>
                  <MenubarContent forceMount>
                    <DynamicItems
                      mode={mode}
                      each={ITEMS}
                      by={(item) => item.value}
                    >
                      {(item) => (
                        <MenubarItem key={item.value}>
                          {menu.label} {item.label} action {mode}
                        </MenubarItem>
                      )}
                    </DynamicItems>
                  </MenubarContent>
                </MenubarPortal>
              </MenubarMenu>
            )}
          </DynamicItems>
        </Menubar>
      ))}
    </div>,
    root
  );

  return {
    clickTwoTriggers: async () => {
      for (const mode of modes()) {
        const trigger = Array.from(container.querySelectorAll('button')).find(
          (button) => button.textContent?.trim() === `Two ${mode}`
        );
        trigger?.click();
      }
      await flushTimes(3);
    },
    report: () =>
      modes().map((mode) => ({
        mode,
        triggers: Array.from(
          container.querySelectorAll('[role="menuitem"]')
        ).filter(
          (item) =>
            item.textContent?.endsWith(mode) &&
            !item.textContent.includes('action')
        ).length,
        actions: Array.from(
          document.body.querySelectorAll('[role="menuitem"]')
        ).filter(
          (item) =>
            item.textContent?.startsWith('Two ') &&
            item.textContent.endsWith(`action ${mode}`)
        ).length,
        hasOneOneAction:
          document.body.textContent?.includes(`One One action ${mode}`) ??
          false,
      })),
  };
}

const ACCORDION_BASE_ITEMS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
] as const;

type AccordionEntry =
  | (typeof ACCORDION_BASE_ITEMS)[number]
  | {
      value: string;
      label: string;
    };

export async function accordionIdentity(
  root: HTMLElement,
  options: { mode: DynamicMode }
) {
  const { mode } = options;
  let setItems: ((next: AccordionEntry[]) => void) | undefined;

  function DynamicAccordion() {
    const items = state<readonly AccordionEntry[]>(ACCORDION_BASE_ITEMS);
    setItems = items.set;

    return (
      <Accordion type="multiple" key={mode} defaultValue={[]}>
        <DynamicItems mode={mode} each={items()} by={(item) => item.value}>
          {(item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionHeader>
                <AccordionTrigger>
                  {item.label} {mode}
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                {item.label} content {mode}
              </AccordionContent>
            </AccordionItem>
          )}
        </DynamicItems>
      </Accordion>
    );
  }

  const container = mount(<DynamicAccordion />, root);
  await flushUpdates();

  const getTrigger = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === `${label} ${mode}`
    ) as HTMLButtonElement | undefined;

  return {
    controls: () => ({
      alpha: getTrigger('Alpha')?.getAttribute('aria-controls') ?? null,
      beta: getTrigger('Beta')?.getAttribute('aria-controls') ?? null,
    }),
    countById: (id: string) =>
      Array.from(container.querySelectorAll('[id]')).filter(
        (node) => node.id === id
      ).length,
    text: () => container.textContent ?? '',
    reorderAndAppend: async () => {
      setItems?.([
        { value: 'beta', label: 'Beta' },
        { value: 'alpha', label: 'Alpha' },
        { value: 'gamma', label: 'Gamma' },
      ]);
      await flushUpdates();
    },
    clear: async () => {
      setItems?.([]);
      await flushUpdates();
    },
    refill: async () => {
      setItems?.([ACCORDION_BASE_ITEMS[0], ACCORDION_BASE_ITEMS[1]]);
      await flushUpdates();
    },
  };
}

const DROPDOWN_INITIAL_ITEMS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'three', label: 'Three' },
];

export async function dropdownReshuffle(
  root: HTMLElement,
  options: { mode: DynamicMode }
) {
  const { mode } = options;
  let setItems:
    | ((next: Array<(typeof DROPDOWN_INITIAL_ITEMS)[number]>) => void)
    | undefined;

  function DynamicDropdown() {
    const items = state(DROPDOWN_INITIAL_ITEMS);
    setItems = items.set;

    return (
      <div>
        <div data-testid="prefix">prefix</div>
        <Dropdown defaultOpen>
          <DropdownTrigger>Open {mode}</DropdownTrigger>
          <DropdownContent forceMount>
            <DynamicItems mode={mode} each={items()} by={(item) => item.value}>
              {(item) => (
                <DropdownItem key={item.value}>
                  {item.label} {mode}
                </DropdownItem>
              )}
            </DynamicItems>
          </DropdownContent>
        </Dropdown>
        <div data-testid="suffix">suffix</div>
      </div>
    );
  }

  const container = mount(<DynamicDropdown />, root);
  await flushUpdates();

  // Captured once, as the original did, so the final check proves the same
  // sibling nodes survived every re-shuffle.
  const before = container.querySelector('[data-testid="prefix"]');
  const after = container.querySelector('[data-testid="suffix"]');

  const setAndFlush = async (next: typeof DROPDOWN_INITIAL_ITEMS) => {
    setItems?.(next);
    await flushTimes(2);
  };

  return {
    hasTrigger: () => container.querySelector('button') !== null,
    siblings: () => ({
      prefix: before?.textContent ?? null,
      suffix: after?.textContent ?? null,
    }),
    hasItem: (label: string) =>
      bodyMenuItemTexts().includes(`${label} ${mode}`),
    items: () => bodyMenuItemTexts(),
    reverse: () =>
      setAndFlush([
        { value: 'three', label: 'Three' },
        { value: 'two', label: 'Two' },
        { value: 'one', label: 'One' },
      ]),
    onlyTwo: () => setAndFlush([{ value: 'two', label: 'Two' }]),
    restore: () => setAndFlush(DROPDOWN_INITIAL_ITEMS),
  };
}

export async function menubarIdentity(root: HTMLElement) {
  const initialMenus = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
  ];
  let setMenus:
    | ((next: Array<{ value: string; label: string }>) => void)
    | undefined;

  function DynamicMenubar() {
    const menus = state(initialMenus);
    setMenus = menus.set;

    return (
      <Menubar id="dynamic-menubar">
        {menus().map((menu) => (
          <MenubarMenu key={menu.value} value={menu.value}>
            <MenubarTrigger>{menu.label}</MenubarTrigger>
            <MenubarPortal>
              <MenubarContent>
                <MenubarItem>{menu.label} action</MenubarItem>
              </MenubarContent>
            </MenubarPortal>
          </MenubarMenu>
        ))}
      </Menubar>
    );
  }

  const container = mount(<DynamicMenubar />, root);
  await flushUpdates();

  const getTrigger = (label: string) =>
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === label
    ) as HTMLButtonElement | undefined;

  const setAndFlush = async (next: typeof initialMenus) => {
    setMenus?.(next);
    await flushTimes(3);
  };

  return {
    controls: () => ({
      alpha: getTrigger('Alpha')?.getAttribute('aria-controls') ?? null,
      beta: getTrigger('Beta')?.getAttribute('aria-controls') ?? null,
    }),
    menuContentCount: (contentId: string) =>
      Array.from(document.body.querySelectorAll('[role="menu"]')).filter(
        (node) => node.id === contentId
      ).length,
    bodyText: () => document.body.textContent ?? '',
    clickBeta: async () => {
      getTrigger('Beta')?.click();
      await flushTimes(3);
    },
    reorder: () => setAndFlush([initialMenus[1]!, initialMenus[0]!]),
    removeBeta: () => setAndFlush([initialMenus[0]!]),
    restore: () => setAndFlush(initialMenus),
  };
}

export function duplicateMenubarValues(root: HTMLElement) {
  let error: string | null = null;
  let container: HTMLElement | undefined;
  try {
    container = mount(
      <Menubar>
        {['First', 'Second'].map((label) => (
          <MenubarMenu key={label} value="duplicate">
            <MenubarTrigger>{label}</MenubarTrigger>
          </MenubarMenu>
        ))}
      </Menubar>,
      root
    );
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }
  if (container) unmount(container);

  return { error: () => error };
}

export function sliderParts(root: HTMLElement) {
  mount(
    <div>
      {modes().map((mode) => (
        <Slider key={mode} defaultValue={25}>
          <DynamicItems mode={mode} each={['track']} by={(part) => part}>
            {() => (
              <SliderTrack key="track">
                <SliderRange />
                <SliderThumb aria-label={`${mode} value`} />
              </SliderTrack>
            )}
          </DynamicItems>
        </Slider>
      ))}
    </div>,
    root
  );
}
