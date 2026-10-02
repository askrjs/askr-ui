import { state } from '@askrjs/askr';
import { Checkbox } from '../../../../../src/components/checkbox';
import { Form } from '../../../../../src/components/form';
import { Input } from '../../../../../src/components/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { VirtualList } from '../../../../../src/components/virtual-list';
import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export async function controlledToUncontrolled(root: HTMLElement) {
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
  mount(<ControlledCheckbox />, root);
  await flushUpdates();

  return {
    clearChecked: async () => {
      checked.set(undefined);
      await flushUpdates();
    },
  };
}

export async function nestedOverlays(root: HTMLElement) {
  mount(
    <Dialog defaultOpen>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Dialog</DialogTitle>
        <Popover defaultOpen>
          <PopoverTrigger>More</PopoverTrigger>
          <PopoverContent>Details</PopoverContent>
        </Popover>
      </DialogContent>
    </Dialog>,
    root
  );
  await flushUpdates();
}

export async function formInsideModal(root: HTMLElement) {
  const onSubmit = spy((event: Event) => event.preventDefault());
  mount(
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Workspace settings</DialogTitle>
        <Form onSubmit={onSubmit}>
          <Input name="workspace" value="Production" />
          <Checkbox name="alerts" defaultChecked />
          <Popover defaultOpen>
            <PopoverTrigger>Choose owner</PopoverTrigger>
            <PopoverContent>Platform team</PopoverContent>
          </Popover>
          <button type="submit">Save settings</button>
        </Form>
      </DialogContent>
    </Dialog>,
    root
  );
  await flushUpdates();

  const form = () =>
    document.body.querySelector('[data-slot="form"]') as HTMLFormElement;

  return {
    focusCheckbox: () => {
      (
        document.body.querySelector('[data-slot="checkbox"]') as HTMLElement
      ).focus();
    },
    focusSubmit: () => {
      (
        form().querySelector('button[type="submit"]') as HTMLButtonElement
      ).focus();
    },
    flush: () => flushUpdates(),
    submitCount: () => onSubmit.count(),
    workspaceValue: () =>
      (form().elements.namedItem('workspace') as HTMLInputElement).value,
  };
}

export async function asChildHydration(root: HTMLElement) {
  const ref = { current: null as HTMLButtonElement | null };
  mount(
    <Popover>
      <PopoverTrigger asChild ref={ref}>
        <button data-slot="host">Open</button>
      </PopoverTrigger>
    </Popover>,
    root
  );
  await flushUpdates();

  return { refTagName: () => ref.current?.tagName ?? null };
}

export async function virtualizedRowIdentity(root: HTMLElement) {
  mount(
    <VirtualList
      items={[{ id: 'a' }, { id: 'b' }]}
      rowHeight={24}
      overscan={2}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <div>{item.id}</div>}
    />,
    root
  );
  await flushUpdates();
}

export async function identicalCompositeIds(root: HTMLElement) {
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

  let container = mount(<IdenticalComposites />, root);
  await flushUpdates();
  await flushUpdates();

  const slots = ['toggle-group-item', 'menu-item', 'menubar-trigger'];
  const readIds = () =>
    Object.fromEntries(
      slots.map((slot) => [
        slot,
        Array.from(
          container.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)
        )
          .filter((node) => node.textContent !== 'Explicit item')
          .map((node) => node.id),
      ])
    ) as Record<string, string[]>;

  return {
    ids: () => readIds(),
    firstMenuItemId: () =>
      container.querySelector<HTMLElement>('[data-slot="menu-item"]')?.id ??
      null,
    explicitMenuItemId: () =>
      Array.from(
        container.querySelectorAll<HTMLElement>('[data-slot="menu-item"]')
      ).find((node) => node.textContent === 'Explicit item')?.id ?? null,
    rerender: async () => {
      rerender.set(1);
      await flushUpdates();
      await flushUpdates();
    },
    /** Unmounts the tree and mounts a lone toggle group; returns its item id. */
    remountSingleToggle: async () => {
      unmount(container);
      container = mount(
        <ToggleGroup>
          <ToggleGroupItem value="same">Same toggle</ToggleGroupItem>
        </ToggleGroup>,
        root
      );
      await flushUpdates();
      return (
        container.querySelector<HTMLElement>('[data-slot="toggle-group-item"]')
          ?.id ?? null
      );
    },
  };
}
