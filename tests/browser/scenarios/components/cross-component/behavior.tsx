import { state } from '@askrjs/askr';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../src/components/accordion';
import { Button } from '../../../../../src/components/button';
import { Checkbox } from '../../../../../src/components/checkbox';
import {
  Collapsible,
  CollapsibleTrigger,
} from '../../../../../src/components/collapsible';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../src/components/radio-group';
import { Form } from '../../../../../src/components/form';
import { Input } from '../../../../../src/components/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../../../../../src/components/dialog';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../src/components/hover-card';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../../../../src/components/select';
import { Switch } from '../../../../../src/components/switch';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../../src/components/toast';
import { Toggle } from '../../../../../src/components/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../../src/components/tooltip';
import { VirtualList } from '../../../../../src/components/virtual-list';
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
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../../../../../src/components/menubar';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../../../src/components/toggle-group';
import { flushUpdates, mount, spy, unmount } from '../../_mount';

export function asChildButtonTypeDefaults(root: HTMLElement) {
  mount(
    <form onSubmit={(event: SubmitEvent) => event.preventDefault()}>
      <Button asChild>
        <button data-testid="native-type-button">Button</button>
      </Button>
      <Toggle asChild>
        <button data-testid="native-type-toggle">Toggle</button>
      </Toggle>
      <ToggleGroup defaultValue="one">
        <ToggleGroupItem asChild value="one">
          <button data-testid="native-type-toggle-group-item">
            Group item
          </button>
        </ToggleGroupItem>
      </ToggleGroup>
      <Accordion defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger asChild>
              <button data-testid="native-type-accordion-trigger">
                Accordion
              </button>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button data-testid="native-type-collapsible-trigger">
            Collapsible
          </button>
        </CollapsibleTrigger>
      </Collapsible>
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <button data-testid="native-type-dialog-trigger">Dialog</button>
        </DialogTrigger>
        <DialogPortal>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogClose asChild>
              <button data-testid="native-type-dialog-close">
                Close dialog
              </button>
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <Dropdown defaultOpen>
        <DropdownTrigger asChild>
          <button data-testid="native-type-dropdown-trigger">Dropdown</button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem asChild>
            <button data-testid="native-type-dropdown-item">
              Dropdown item
            </button>
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild>
          <button data-testid="native-type-hover-card-trigger">
            Hover card
          </button>
        </HoverCardTrigger>
        <HoverCardContent>Preview</HoverCardContent>
      </HoverCard>
      <Menu>
        <MenuContent>
          <MenuItem asChild>
            <button data-testid="native-type-menu-item">Menu item</button>
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger asChild>
            <button data-testid="native-type-menubar-trigger">File</button>
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem asChild>
                <button data-testid="native-type-menubar-item">Open</button>
              </MenubarItem>
              <MenubarSub value="more">
                <MenubarSubTrigger asChild>
                  <button data-testid="native-type-menubar-sub-trigger">
                    More
                  </button>
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem asChild>
                    <button data-testid="native-type-menubar-sub-item">
                      Nested
                    </button>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button data-testid="native-type-popover-trigger">Popover</button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent forceMount>
            <PopoverClose asChild>
              <button data-testid="native-type-popover-close">
                Close popover
              </button>
            </PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      <RadioGroup defaultValue="one">
        <RadioGroupItem asChild value="one">
          <button data-testid="native-type-radio-group-item">Radio</button>
        </RadioGroupItem>
      </RadioGroup>
      <Select defaultOpen defaultValue="one">
        <SelectTrigger asChild>
          <button data-testid="native-type-select-trigger">Select</button>
        </SelectTrigger>
        <SelectContent>
          <SelectItem asChild value="one">
            <button data-testid="native-type-select-item">One</button>
          </SelectItem>
        </SelectContent>
      </Select>
      <Switch asChild>
        <button data-testid="native-type-switch">Switch</button>
      </Switch>
      <ToastHost duration={Infinity}>
        <ToastViewport />
        <Toast defaultOpen>
          <ToastTitle>Saved</ToastTitle>
          <ToastAction asChild>
            <button data-testid="native-type-toast-action">Undo</button>
          </ToastAction>
          <ToastClose asChild>
            <button data-testid="native-type-toast-close">Close</button>
          </ToastClose>
        </Toast>
      </ToastHost>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button data-testid="native-type-tooltip-trigger">Tooltip</button>
        </TooltipTrigger>
        <TooltipContent>Helpful text</TooltipContent>
      </Tooltip>
    </form>,
    root
  );

  return {
    types: () =>
      Object.fromEntries(
        Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            'button[data-testid^="native-type-"]'
          ),
          (button) => [
            button.dataset.testid?.replace('native-type-', ''),
            button.type,
          ]
        )
      ),
  };
}

export async function controlledToUncontrolled(root: HTMLElement) {
  let checked!: ReturnType<typeof state<boolean | undefined>>;
  let value!: ReturnType<typeof state<string | undefined>>;
  let phase!: ReturnType<typeof state<number>>;
  const requests: { control: string; next: boolean | string; phase: number }[] =
    [];
  const checkboxRef = { current: null as HTMLInputElement | null };
  const radioRef = { current: null as HTMLElement | null };
  function Controls() {
    checked = state<boolean | undefined>(true);
    value = state<string | undefined>('beta');
    phase = state(0);
    const currentPhase = phase();
    return (
      <div>
        <Checkbox
          ref={checkboxRef}
          checked={checked()}
          defaultChecked={false}
          onCheckedChange={(next) =>
            requests.push({ control: 'checkbox', next, phase: currentPhase })
          }
        />
        <RadioGroup
          ref={radioRef}
          name="workspace"
          value={value()}
          defaultValue="alpha"
          onValueChange={(next) =>
            requests.push({ control: 'radio', next, phase: currentPhase })
          }
        >
          <RadioGroupItem value="alpha">Alpha</RadioGroupItem>
          <RadioGroupItem value="beta">Beta</RadioGroupItem>
        </RadioGroup>
      </div>
    );
  }
  mount(<Controls />, root);
  await flushUpdates();
  const originalCheckbox = checkboxRef.current;
  const originalRadio = radioRef.current;
  return {
    clearValues: async () => {
      checked.set(undefined);
      value.set(undefined);
      phase.set(1);
      await flushUpdates();
    },
    defineValues: async () => {
      checked.set(false);
      value.set('alpha');
      phase.set(2);
      await flushUpdates();
    },
    requests: () => requests,
    sameNodes: () =>
      checkboxRef.current === originalCheckbox &&
      radioRef.current === originalRadio &&
      !!originalCheckbox?.isConnected &&
      !!originalRadio?.isConnected,
  };
}

export async function nestedOverlays(
  root: HTMLElement,
  options?: { removeTrigger?: boolean }
) {
  let outerOpen!: ReturnType<typeof state<boolean>>;
  let innerOpen!: ReturnType<typeof state<boolean>>;
  let triggerShown!: ReturnType<typeof state<boolean>>;
  let survivorOpen!: ReturnType<typeof state<boolean>>;
  const requests: { owner: string; open: boolean }[] = [];
  const restoreRef = { current: null as HTMLButtonElement | null };
  const outerRef = { current: null as HTMLElement | null };
  const innerRef = { current: null as HTMLElement | null };
  let capturedOuter: HTMLElement | null = null;
  let capturedInner: HTMLElement | null = null;
  let staleFocus = 0;
  function Overlays() {
    outerOpen = state(false);
    innerOpen = state(true);
    triggerShown = state(true);
    survivorOpen = state(false);
    return (
      <div>
        <button ref={restoreRef}>Persistent restore target</button>
        <Dialog
          open={outerOpen()}
          onOpenChange={(open) => {
            requests.push({ owner: 'outer', open });
            outerOpen.set(open);
          }}
        >
          {triggerShown() ? <DialogTrigger>Open outer</DialogTrigger> : null}
          <DialogPortal>
            <DialogContent
              ref={outerRef}
              restoreFocus={
                options?.removeTrigger ? () => restoreRef.current : undefined
              }
            >
              <DialogTitle>Outer dialog</DialogTitle>
              <Popover
                open={innerOpen()}
                onOpenChange={(open) => {
                  requests.push({ owner: 'inner', open });
                  innerOpen.set(open);
                }}
              >
                <PopoverTrigger>More</PopoverTrigger>
                <PopoverPortal>
                  <PopoverContent ref={innerRef}>
                    <button>Inner action</button>
                  </PopoverContent>
                </PopoverPortal>
              </Popover>
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <Popover
          open={survivorOpen()}
          onOpenChange={(open) => {
            requests.push({ owner: 'survivor', open });
            survivorOpen.set(open);
          }}
        >
          <PopoverTrigger>Survivor</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent>
              <button>Surviving action</button>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
      </div>
    );
  }
  mount(<Overlays />, root);
  await flushUpdates();
  return {
    requests: () => requests,
    clearRequests: () => {
      requests.length = 0;
    },
    closeOuter: async () => {
      capturedOuter = outerRef.current;
      capturedInner = innerRef.current;
      capturedOuter?.querySelectorAll('button').forEach((node) =>
        node.addEventListener('focus', () => {
          staleFocus += 1;
        })
      );
      capturedInner?.querySelectorAll('button').forEach((node) =>
        node.addEventListener('focus', () => {
          staleFocus += 1;
        })
      );
      if (options?.removeTrigger) triggerShown.set(false);
      outerOpen.set(false);
      await flushUpdates();
    },
    detached: () => ({
      outer: !!capturedOuter && !capturedOuter.isConnected,
      inner: !!capturedInner && !capturedInner.isConnected,
      staleFocus,
    }),
  };
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
