import type { JSX } from '@askrjs/askr/jsx-runtime';
import { state } from '@askrjs/askr';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../../../src/components/select';
import { flushUpdates, mount, spy } from '../../_mount';

export function viewportResize(root: HTMLElement): void {
  mount(
    <Select defaultValue="askr">
      <SelectTrigger aria-label="Framework">
        <SelectValue />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr">Askr</SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export function hiddenInput(root: HTMLElement): void {
  mount(
    <Select name="framework" defaultValue="askr">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr">Askr</SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export function triggerSize(root: HTMLElement): void {
  mount(
    <Select defaultValue="askr">
      <SelectTrigger size="sm">
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr">Askr</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export function rootDisabled(root: HTMLElement): void {
  mount(
    <Select disabled name="framework" defaultValue="askr">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr">Askr</SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export async function focusedOptionDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicSelect() {
    disabled = state(false);
    return (
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr" disabled={disabled()}>
              Askr
            </SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  }

  mount(<DynamicSelect />, root);
  await flushUpdates();
  await flushUpdates();
  return {
    disableAskr: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

export function explicitTextValue(root: HTMLElement): void {
  mount(
    <Select defaultValue="askr">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr" textValue="Askr">
            <SelectItemText>
              <span>Askr</span>
            </SelectItemText>
            <span aria-hidden="true"> Framework</span>
          </SelectItem>
          <SelectItem value="solid">Solid</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export async function labelledGroup(root: HTMLElement): Promise<void> {
  mount(
    <Select defaultOpen defaultValue="askr">
      <SelectTrigger aria-label="Framework">
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectGroup>
            <div>
              <SelectLabel>Frameworks</SelectLabel>
            </div>
            <SelectItem value="askr">Askr</SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
  await flushUpdates();
}

export function disabledItem(root: HTMLElement): void {
  mount(
    <Select name="framework" defaultValue="askr">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr">Askr</SelectItem>
          <SelectItem value="solid" disabled>
            Solid
          </SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

export async function allItemsDisabled(root: HTMLElement): Promise<void> {
  mount(
    <Select defaultOpen defaultValue="askr">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="askr" disabled>
            Askr
          </SelectItem>
          <SelectItem value="solid" disabled>
            Solid
          </SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}

export function bufferedTypeahead(root: HTMLElement) {
  mount(
    <Select name="database" defaultValue="alpha">
      <SelectTrigger>
        <SelectValue placeholder="Choose one" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent tabIndex={0}>
          <SelectItem value="alpha">Alpha</SelectItem>
          <SelectItem value="database-1" textValue="Database1" disabled>
            Disabled database
          </SelectItem>
          <SelectItem value="database-2" textValue="Database2">
            Primary database
          </SelectItem>
          <SelectItem value="database-archive" textValue="Database Archive">
            Archived database
          </SelectItem>
          <SelectItem value="delta">Delta</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );

  // Registered on window, so it sees each keydown after every component
  // handler on the bubble path has run.
  const prevented: boolean[] = [];
  const onKeydown = (event: KeyboardEvent) => {
    prevented.push(event.defaultPrevented);
  };
  window.addEventListener('keydown', onKeydown);

  return {
    lastKeydownPrevented: () => prevented.at(-1) ?? null,
    stopRecording: () => window.removeEventListener('keydown', onKeydown),
  };
}

export function arrowSpaceEnterTab(root: HTMLElement): void {
  mount(
    <div>
      <Select name="framework" defaultValue="alpha">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem asChild value="beta">
              <span>Beta</span>
            </SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
      <button type="button" data-testid="after-select">
        After select
      </button>
    </div>,
    root
  );
}

export function spaceThenTab(root: HTMLElement): void {
  mount(
    <div>
      <Select defaultValue="alpha">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="alpha">Alpha</SelectItem>
            <SelectItem value="beta">Beta</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
      <button type="button" data-testid="after-select">
        After select
      </button>
    </div>,
    root
  );
}

export function asChildTrigger(root: HTMLElement): void {
  mount(
    <Select defaultValue="alpha">
      <SelectTrigger asChild>
        <span>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="alpha">Alpha</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
}

function captureMountError(element: JSX.Element, root: HTMLElement): string {
  try {
    mount(element, root);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return '';
}

export function orphanContent(root: HTMLElement) {
  const message = captureMountError(
    <SelectPortal>
      <SelectContent>
        <SelectItem value="askr">Askr</SelectItem>
      </SelectContent>
    </SelectPortal>,
    root
  );
  return { message: () => message };
}

export function itemWithinSelect(root: HTMLElement): void {
  mount(
    <Select>
      <SelectTrigger>Open</SelectTrigger>
      <SelectPortal>
        <SelectItem value="askr">Askr</SelectItem>
      </SelectPortal>
    </Select>,
    root
  );
}

export function orphanTrigger(root: HTMLElement) {
  const message = captureMountError(
    <SelectTrigger>Orphan</SelectTrigger>,
    root
  );
  return { message: () => message };
}

export async function rtlVertical(root: HTMLElement): Promise<void> {
  mount(
    <div dir="rtl">
      <Select defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    </div>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}

export async function formReset(root: HTMLElement) {
  const onValueChange = spy<[string]>();
  const container = mount(
    <form>
      <Select
        name="framework"
        defaultValue="askr"
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    </form>,
    root
  );
  await flushUpdates();

  return {
    reset: async () => {
      (container.querySelector('form') as HTMLFormElement).reset();
      await flushUpdates();
      await flushUpdates();
    },
    calls: () => onValueChange.calls,
  };
}
