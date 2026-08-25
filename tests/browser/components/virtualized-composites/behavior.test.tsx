import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
} from '../../../../src/components/dropdown';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
} from '../../../../src/components/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../src/components/toggle-group';
import { VirtualList } from '../../../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableColumn,
} from '../../../../src/components/virtual-table';
import { flushUpdates, mount, unmount } from '../../test-utils';

const items = Array.from({ length: 100 }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index}`,
}));

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

const fixtures = [
  {
    name: 'ToggleGroup',
    key: 'ArrowDown',
    render: () => (
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
  },
  {
    name: 'RadioGroup',
    key: 'ArrowDown',
    render: () => (
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
  },
  {
    name: 'Menu',
    key: 'ArrowDown',
    render: () => (
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
  },
  {
    name: 'Select',
    key: 'ArrowDown',
    render: () => (
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
  },
  {
    name: 'Dropdown',
    key: 'ArrowDown',
    render: () => (
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
  },
  {
    name: 'Menubar',
    key: 'ArrowRight',
    render: () => (
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
  },
] as const;

describe('virtualized composite navigation', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  for (const fixture of fixtures) {
    it(`should preserve dataset indices and advance ${fixture.name} focus beyond the mounted window`, async () => {
      container = mount(fixture.render());
      await flushUpdates();
      await nextAnimationFrame();
      await flushUpdates();
      const viewport = container.querySelector(
        '[data-slot="virtual-list"]'
      ) as HTMLElement;
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
      viewport.scrollTop = 800;
      expect(viewport.scrollTop).toBeGreaterThanOrEqual(799);
      viewport.dispatchEvent(new Event('scroll'));
      await flushUpdates();
      await flushUpdates();
      await flushUpdates();

      let item42 = Array.from(
        container.querySelectorAll<HTMLElement>('[data-roving-index]')
      ).find((node) => node.textContent?.trim() === 'Item 42');
      expect(item42?.dataset.rovingIndex).toBe('42');
      item42?.click();
      await flushUpdates();
      item42 = Array.from(
        container.querySelectorAll<HTMLElement>('[data-roving-index]')
      ).find((node) => node.textContent?.trim() === 'Item 42');
      item42?.focus({ preventScroll: true });
      item42?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: fixture.key,
        })
      );
      await flushUpdates();
      await flushUpdates();
      await flushUpdates();
      await nextAnimationFrame();
      await flushUpdates();

      const liveViewport = container.querySelector(
        '[data-slot="virtual-list"]'
      ) as HTMLElement;
      expect(
        Number(liveViewport.dataset.virtualVisibleStartIndex)
      ).toBeGreaterThan(40);
      expect(document.activeElement?.textContent?.trim()).toBe('Item 43');
    });
  }

  it('should preserve dataset indices inside a virtualized Menubar menu surface', async () => {
    container = mount(
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
      </Menubar>
    );
    await flushUpdates();
    container
      .querySelector<HTMLElement>('[data-slot="menubar-trigger"]')
      ?.click();
    await flushUpdates();
    await flushUpdates();
    const viewport = document.querySelector<HTMLElement>(
      '[data-slot="menubar-content"] [data-slot="virtual-list"]'
    )!;
    viewport.scrollTop = 800;
    viewport.dispatchEvent(new Event('scroll'));
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    const renderedItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-slot="menubar-item"][data-roving-index]'
      )
    );
    expect(renderedItems.at(-1)?.dataset.rovingIndex).toBe('42');
    renderedItems[0]?.focus({ preventScroll: true });
    for (let step = 0; step < 3; step += 1) {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'ArrowDown',
        })
      );
      await flushUpdates();
      await flushUpdates();
    }
    await flushUpdates();

    expect(Number(viewport.dataset.virtualVisibleStartIndex)).toBeGreaterThan(
      40
    );
    expect(document.activeElement?.textContent?.trim()).toBe('Item 43');
  });

  it('should derive composite placement and restore off-window focus through VirtualTable rows', async () => {
    const columns: readonly VirtualTableColumn<(typeof items)[number]>[] = [
      {
        id: 'item',
        header: 'Item',
        cellComponent: ({ row }) => (
          <ToggleGroupItem value={row.id}>{row.label}</ToggleGroupItem>
        ),
      },
    ];
    container = mount(
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
      </ToggleGroup>
    );
    await flushUpdates();
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="virtual-table"]'
    )!;
    viewport.scrollTop = 820;
    viewport.dispatchEvent(new Event('scroll'));
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    let renderedItems = Array.from(
      container.querySelectorAll<HTMLElement>('[data-roving-index]')
    );
    expect(renderedItems.length).toBeGreaterThan(0);
    for (const item of renderedItems) {
      expect(item.textContent?.trim()).toBe(`Item ${item.dataset.rovingIndex}`);
    }
    const targetIndex = Number(renderedItems.at(-1)!.dataset.rovingIndex);
    renderedItems.at(-1)!.click();
    await flushUpdates();
    renderedItems = Array.from(
      container.querySelectorAll<HTMLElement>('[data-roving-index]')
    );
    const target = renderedItems.find(
      (node) => Number(node.dataset.rovingIndex) === targetIndex
    )!;
    target.focus({ preventScroll: true });
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ArrowDown',
      })
    );
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(viewport.scrollTop).toBeGreaterThan(820);
    expect(document.activeElement?.textContent?.trim()).toBe(
      `Item ${targetIndex + 1}`
    );
  });

  it('should not leak a virtual row index into a composite owned by that row', async () => {
    container = mount(
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
      />
    );
    await flushUpdates();
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="virtual-list"]'
    )!;
    viewport.scrollTop = 800;
    viewport.dispatchEvent(new Event('scroll'));
    await flushUpdates();
    await flushUpdates();

    const renderedRows = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-slot="virtual-list-row"][data-visible="true"]'
      )
    );
    expect(renderedRows.length).toBeGreaterThan(0);
    for (const row of renderedRows) {
      expect(
        Array.from(
          row.querySelectorAll<HTMLElement>('[data-roving-index]')
        ).map((item) => item.dataset.rovingIndex)
      ).toEqual(['0', '1']);
    }
  });
});
