import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
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
} from '../../../../../src/components/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { VirtualList } from '../../../../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableColumn,
} from '../../../../../src/components/virtual-table';
import { flushUpdates, mount } from '../../_mount';

const items = Array.from({ length: 100 }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index}`,
}));

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function flushTimes(count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) await flushUpdates();
}

/**
 * Scrolls a virtual viewport the way the vitest original did: set
 * `scrollTop`, then dispatch `scroll` synchronously so the window re-renders
 * without waiting on the browser's own scroll event.
 */
async function scrollViewport(
  viewport: HTMLElement,
  top: number,
  flushes: number
): Promise<number> {
  viewport.scrollTop = top;
  const scrolledTo = viewport.scrollTop;
  viewport.dispatchEvent(new Event('scroll'));
  await flushTimes(flushes);
  return scrolledTo;
}

function activeText(): string | null {
  return document.activeElement?.textContent?.trim() ?? null;
}

const fixtures: Record<string, () => JSX.Element> = {
  ToggleGroup: () => (
    <ToggleGroup orientation="vertical">
      <VirtualList
        style={{ height: '60px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <ToggleGroupItem value={item.id}>{item.label}</ToggleGroupItem>
        )}
      />
    </ToggleGroup>
  ),
  RadioGroup: () => (
    <RadioGroup orientation="vertical">
      <VirtualList
        style={{ height: '60px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <RadioGroupItem value={item.id}>{item.label}</RadioGroupItem>
        )}
      />
    </RadioGroup>
  ),
  Menu: () => (
    <Menu>
      <MenuContent>
        <VirtualList
          style={{ height: '60px', overflowY: 'auto' }}
          items={items}
          rowHeight={20}
          getKey={(item) => item.id}
          rowComponent={({ item }) => (
            <MenuItem textValue={item.label}>{item.label}</MenuItem>
          )}
        />
      </MenuContent>
    </Menu>
  ),
  Select: () => (
    <Select open>
      <SelectContent>
        <VirtualList
          style={{ height: '60px', overflowY: 'auto' }}
          items={items}
          rowHeight={20}
          getKey={(item) => item.id}
          rowComponent={({ item }) => (
            <SelectItem value={item.id}>{item.label}</SelectItem>
          )}
        />
      </SelectContent>
    </Select>
  ),
  Dropdown: () => (
    <Dropdown open>
      <DropdownContent>
        <VirtualList
          style={{ height: '60px', overflowY: 'auto' }}
          items={items}
          rowHeight={20}
          getKey={(item) => item.id}
          rowComponent={({ item }) => (
            <DropdownItem value={item.id}>{item.label}</DropdownItem>
          )}
        />
      </DropdownContent>
    </Dropdown>
  ),
  Menubar: () => (
    <Menubar>
      <VirtualList
        style={{ height: '60px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => (
          <MenubarMenu value={item.id}>
            <MenubarTrigger>{item.label}</MenubarTrigger>
          </MenubarMenu>
        )}
      />
    </Menubar>
  ),
};

export async function compositeBeyondWindow(
  root: HTMLElement,
  options: { name: string }
) {
  const container = mount(fixtures[options.name]!(), root);
  await flushUpdates();
  await nextAnimationFrame();
  await flushUpdates();

  const viewport = () =>
    container.querySelector('[data-slot="virtual-list"]') as HTMLElement;
  const findItem = (label: string) =>
    Array.from(
      container.querySelectorAll<HTMLElement>('[data-roving-index]')
    ).find((node) => node.textContent?.trim() === label);

  return {
    overflow: () => ({
      scrollHeight: viewport().scrollHeight,
      clientHeight: viewport().clientHeight,
    }),
    scrollTo: (top: number) => scrollViewport(viewport(), top, 3),
    rovingIndex: (label: string) =>
      findItem(label)?.dataset.rovingIndex ?? null,
    click: async (label: string) => {
      findItem(label)?.click();
      await flushUpdates();
    },
    focus: (label: string) => {
      findItem(label)?.focus({ preventScroll: true });
      return activeText();
    },
    navigation: () => ({
      visibleStartIndex: Number(viewport().dataset.virtualVisibleStartIndex),
      activeText: activeText(),
    }),
  };
}

export async function menubarMenuSurface(root: HTMLElement) {
  const container = mount(
    <Menubar>
      <MenubarMenu value="actions">
        <MenubarTrigger>Actions</MenubarTrigger>
        <MenubarContent>
          <VirtualList
            style={{ height: '60px', overflowY: 'auto' }}
            items={items}
            rowHeight={20}
            getKey={(item) => item.id}
            rowComponent={({ item }) => (
              <MenubarItem textValue={item.label}>{item.label}</MenubarItem>
            )}
          />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
    root
  );
  await flushUpdates();

  const viewport = () =>
    document.querySelector<HTMLElement>(
      '[data-slot="menubar-content"] [data-slot="virtual-list"]'
    )!;
  const renderedItems = () =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-slot="menubar-item"][data-roving-index]'
      )
    );

  return {
    openMenu: async () => {
      container
        .querySelector<HTMLElement>('[data-slot="menubar-trigger"]')
        ?.click();
      await flushTimes(2);
    },
    scrollTo: (top: number) => scrollViewport(viewport(), top, 3),
    lastRenderedIndex: () =>
      renderedItems().at(-1)?.dataset.rovingIndex ?? null,
    focusFirstRendered: () => {
      renderedItems()[0]?.focus({ preventScroll: true });
      return activeText();
    },
    navigation: () => ({
      visibleStartIndex: Number(viewport().dataset.virtualVisibleStartIndex),
      activeText: activeText(),
    }),
  };
}

export async function virtualTableRows(root: HTMLElement) {
  const columns: readonly VirtualTableColumn<(typeof items)[number]>[] = [
    {
      id: 'item',
      header: 'Item',
      cellComponent: ({ row }) => (
        <ToggleGroupItem value={row.id}>{row.label}</ToggleGroupItem>
      ),
    },
  ];
  const container = mount(
    <ToggleGroup orientation="vertical">
      <VirtualTable
        aria-label="Virtualized composite items"
        style={{ height: '60px', overflowY: 'auto' }}
        rows={items}
        rowHeight={20}
        headerHeight={20}
        getKey={(item) => item.id}
        columns={columns}
      />
    </ToggleGroup>,
    root
  );
  await flushUpdates();

  const viewport = container.querySelector<HTMLElement>(
    '[data-slot="virtual-table"]'
  )!;
  const renderedItems = () =>
    Array.from(container.querySelectorAll<HTMLElement>('[data-roving-index]'));

  return {
    scrollTo: (top: number) => scrollViewport(viewport, top, 3),
    rendered: () =>
      renderedItems().map((item) => ({
        text: item.textContent?.trim() ?? null,
        index: item.dataset.rovingIndex ?? null,
      })),
    clickIndex: async (index: number) => {
      renderedItems()
        .find((node) => Number(node.dataset.rovingIndex) === index)
        ?.click();
      await flushUpdates();
    },
    focusIndex: (index: number) => {
      renderedItems()
        .find((node) => Number(node.dataset.rovingIndex) === index)
        ?.focus({ preventScroll: true });
      return activeText();
    },
    navigation: () => ({
      scrollTop: viewport.scrollTop,
      activeText: activeText(),
    }),
  };
}

export async function rowOwnedComposite(root: HTMLElement) {
  const container = mount(
    <VirtualList
      style={{ height: '60px', overflowY: 'auto' }}
      items={items}
      rowHeight={20}
      getKey={(item) => item.id}
      rowComponent={({ item }) => (
        <ToggleGroup>
          <ToggleGroupItem value={`${item.id}-a`}>A</ToggleGroupItem>
          <ToggleGroupItem value={`${item.id}-b`}>B</ToggleGroupItem>
        </ToggleGroup>
      )}
    />,
    root
  );
  await flushUpdates();

  const viewport = container.querySelector<HTMLElement>(
    '[data-slot="virtual-list"]'
  )!;

  return {
    scrollTo: (top: number) => scrollViewport(viewport, top, 2),
    rowIndices: () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-slot="virtual-list-row"][data-visible="true"]'
        )
      ).map((row) =>
        Array.from(
          row.querySelectorAll<HTMLElement>('[data-roving-index]')
        ).map((item) => item.dataset.rovingIndex)
      ),
  };
}
