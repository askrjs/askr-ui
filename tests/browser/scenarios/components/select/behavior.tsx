import type { JSX } from '@askrjs/askr/jsx-runtime';
import { state } from '@askrjs/askr';
import { For } from '@askrjs/askr/control';
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

export function customContentId(
  root: HTMLElement,
  options: { callerAria?: boolean } = {}
) {
  let contentId!: ReturnType<typeof state<string>>;
  function CustomSelect() {
    contentId = state('caller-select-content');
    return (
      <Select defaultOpen>
        <SelectTrigger
          aria-controls={
            options.callerAria ? 'caller-owned-controls' : undefined
          }
        >
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent id={() => contentId()}>
            <SelectItem value="one">One</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  }
  mount(<CustomSelect />, root);
  return {
    updateId: async () => {
      contentId.set('updated-select-content');
      await flushUpdates();
    },
  };
}

export function reactiveGroupLabelId(root: HTMLElement) {
  let labelId!: ReturnType<typeof state<string>>;
  let shown!: ReturnType<typeof state<boolean>>;
  function CallerLabel() {
    labelId = state('caller-frameworks');
    shown = state(true);
    return shown() ? (
      <SelectLabel id={() => labelId()}>Frameworks</SelectLabel>
    ) : null;
  }
  mount(
    <Select>
      <SelectGroup>
        <CallerLabel />
      </SelectGroup>
    </Select>,
    root
  );
  return {
    updateId: async () => {
      labelId.set('updated-frameworks');
      await flushUpdates();
    },
    hide: async () => {
      shown.set(false);
      await flushUpdates();
    },
    show: async () => {
      shown.set(true);
      await flushUpdates();
    },
  };
}

export function ownKeyboardCaller(
  root: HTMLElement,
  options: { cancel?: boolean; target?: 'trigger' | 'item' } = {}
) {
  let calls = 0;
  const onKeyDown = (event: KeyboardEvent) => {
    calls += 1;
    if (options.cancel) event.preventDefault();
  };
  mount(
    <Select defaultOpen={options.target === 'item'} defaultValue="one">
      <SelectTrigger
        data-caller="preserved"
        onKeyDown={options.target === 'trigger' ? onKeyDown : undefined}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem
            value="one"
            data-caller="preserved"
            onKeyDown={options.target === 'item' ? onKeyDown : undefined}
          >
            One
          </SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
  return { calls: () => calls };
}

export function callerCancellation(root: HTMLElement) {
  let calls = 0;
  mount(
    <Select defaultOpen defaultValue="one">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          data-caller="preserved"
          onKeyDown={(event) => {
            calls += 1;
            event.preventDefault();
          }}
        >
          <SelectItem value="one">One</SelectItem>
          <SelectItem value="two">Two</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
    root
  );
  return { calls: () => calls };
}

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

function WrappedOptions() {
  return (
    <>
      <SelectItem value="askr">Askr</SelectItem>
      <SelectItem value="solid">Solid</SelectItem>
    </>
  );
}
function WrappedLabel() {
  return <SelectLabel>Frameworks</SelectLabel>;
}
export function wrappedOptions(
  root: HTMLElement,
  options?: { forRendered?: boolean }
): void {
  mount(
    <form>
      <Select name="framework" defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectGroup>
              <WrappedLabel />
              {options?.forRendered ? (
                <For
                  each={[
                    { value: 'askr', text: 'Askr' },
                    { value: 'solid', text: 'Solid' },
                  ]}
                  by={(item) => item.value}
                >
                  {(item) => (
                    <SelectItem value={item.value}>{item.text}</SelectItem>
                  )}
                </For>
              ) : (
                <WrappedOptions />
              )}
            </SelectGroup>
          </SelectContent>
        </SelectPortal>
      </Select>
      <button type="reset">Reset choice</button>
    </form>,
    root
  );
}

export function removableWrappedLabel(root: HTMLElement) {
  let shown!: ReturnType<typeof state<boolean>>;
  function WrappedDynamicLabel() {
    shown = state(true);
    return shown() ? <SelectLabel>Frameworks</SelectLabel> : null;
  }
  mount(
    <Select defaultOpen>
      <SelectGroup>
        <WrappedDynamicLabel />
        <SelectItem value="askr">Askr</SelectItem>
      </SelectGroup>
      <SelectGroup aria-labelledby="caller-label">
        <SelectLabel>Internal label</SelectLabel>
        <SelectItem value="solid">Solid</SelectItem>
      </SelectGroup>
      <span id="caller-label">Caller name</span>
    </Select>,
    root
  );
  return {
    hideLabel: () => shown.set(false),
    showLabel: () => shown.set(true),
  };
}

export function removedLiteralOption(root: HTMLElement) {
  let shown!: ReturnType<typeof state<boolean>>;
  function LiteralOptions() {
    shown = state(true);
    return (
      <Select value="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            {shown() ? <SelectItem value="askr">Askr</SelectItem> : null}
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  }
  mount(<LiteralOptions />, root);
  return { removeSelected: () => shown.set(false) };
}
