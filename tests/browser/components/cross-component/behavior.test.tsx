import { afterEach, describe, expect, it } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { createIsland } from '@askrjs/askr/boot';
import { Checkbox } from '../../../../src/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../src/components/popover';
import { VirtualList } from '../../../../src/components/virtual-list';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../src/components/toggle-group';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Cross-component contracts', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should preserve controlled-to-uncontrolled state transitions given native controls when the value or checked prop changes from defined to undefined', async () => {
    let checked!: ReturnType<typeof state<boolean | undefined>>;
    function ControlledCheckbox() {
      checked = state<boolean | undefined>(true);
      return (
        <Checkbox
          checked={checked()}
          onCheckedChange={(next) => checked.set(next)}
        />
      );
    }
    container = document.createElement('div');
    document.body.appendChild(container);
    createIsland({ root: container, component: ControlledCheckbox });
    await flushUpdates();
    expect(
      container
        .querySelector('[data-slot="checkbox"]')
        ?.getAttribute('data-state')
    ).toBe('checked');
    checked.set(undefined);
    await flushUpdates();
    expect(container.querySelector('[data-slot="checkbox"]')).not.toBeNull();
  });

  it('should restore focus through nested overlays given dialog and popover content when overlays close in different orders', async () => {
    container = mount(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog</DialogTitle>
          <Popover defaultOpen>
            <PopoverTrigger>More</PopoverTrigger>
            <PopoverContent>Details</PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>
    );
    await flushUpdates();
    expect(
      document.body.querySelector('[data-slot="dialog-content"]')
    ).not.toBeNull();
    expect(
      document.body.querySelector('[data-slot="popover-content"]')
    ).not.toBeNull();
  });

  it('should hydrate asChild hosts without replacing nodes given server-rendered component trees when client props attach', async () => {
    const ref = { current: null as HTMLButtonElement | null };
    container = mount(
      <Popover>
        <PopoverTrigger asChild ref={ref}>
          <button data-slot="host">Open</button>
        </PopoverTrigger>
      </Popover>
    );
    await flushUpdates();
    expect(ref.current?.tagName).toBe('BUTTON');
    expect(
      container.querySelector('[data-slot="popover-trigger"]')
    ).not.toBeNull();
  });

  it('should preserve virtualized row identity given reorder, resize, and scroll-anchor changes when data updates during virtualization', async () => {
    container = mount(
      <VirtualList
        items={[{ id: 'a' }, { id: 'b' }]}
        rowHeight={24}
        overscan={2}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <div>{item.id}</div>}
      />
    );
    await flushUpdates();
    expect(container.querySelector('[data-key="a"]')).not.toBeNull();
    expect(container.querySelector('[data-key="b"]')).not.toBeNull();
  });

  it('should isolate identical composite ids while keeping each mounted identity stable', async () => {
    let rerender!: ReturnType<typeof state<number>>;
    function IdenticalComposites() {
      rerender = state(0);
      return (
        <div data-render={rerender()}>
          <ToggleGroup>
            <ToggleGroupItem value="same">Same toggle</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupItem value="same">Same toggle</ToggleGroupItem>
          </ToggleGroup>
          <Menu>
            <MenuContent>
              <MenuItem>Same menu item</MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuContent>
              <MenuItem>Same menu item</MenuItem>
            </MenuContent>
          </Menu>
          <Menubar>
            <MenubarMenu value="same">
              <MenubarTrigger>Same menubar</MenubarTrigger>
            </MenubarMenu>
          </Menubar>
          <Menubar>
            <MenubarMenu value="same">
              <MenubarTrigger>Same menubar</MenubarTrigger>
            </MenubarMenu>
          </Menubar>
          <Menu id="explicit-menu">
            <MenuContent>
              <MenuItem>Explicit item</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      );
    }

    container = mount(<IdenticalComposites />);
    await flushUpdates();
    await flushUpdates();
    const slots = ['toggle-group-item', 'menu-item', 'menubar-trigger'];
    const initialIds = new Map<string, string[]>();

    for (const slot of slots) {
      const ids = Array.from(
        container.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)
      )
        .filter((node) => node.textContent !== 'Explicit item')
        .map((node) => node.id);
      expect(ids).toHaveLength(2);
      expect(new Set(ids).size).toBe(2);
      initialIds.set(slot, ids);
    }
    expect(
      container.querySelector<HTMLElement>('[data-slot="menu-item"]')?.id
    ).not.toBe('menu-explicit-menu-item-0');
    expect(
      Array.from(
        container.querySelectorAll<HTMLElement>('[data-slot="menu-item"]')
      ).find((node) => node.textContent === 'Explicit item')?.id
    ).toBe('menu-explicit-menu-item-0');

    rerender.set(1);
    await flushUpdates();
    await flushUpdates();

    for (const slot of slots) {
      const ids = Array.from(
        container.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)
      )
        .filter((node) => node.textContent !== 'Explicit item')
        .map((node) => node.id);
      expect(ids).toEqual(initialIds.get(slot));
    }

    const firstToggleId = initialIds.get('toggle-group-item')![0];
    unmount(container);
    container = mount(
      <ToggleGroup>
        <ToggleGroupItem value="same">Same toggle</ToggleGroupItem>
      </ToggleGroup>
    );
    await flushUpdates();
    expect(
      container.querySelector<HTMLElement>('[data-slot="toggle-group-item"]')
        ?.id
    ).toBe(firstToggleId);
  });
});
