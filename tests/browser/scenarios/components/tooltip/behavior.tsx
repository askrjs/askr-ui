import { state } from '@askrjs/askr';
import { Button } from '../../../../../src/components/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../src/components/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../../../src/components/tooltip';
import { mount, settle, spy, unmount } from '../../_mount';

/** Calls `node.focus()` and reports what, if anything, it threw. */
function focusReportingError(node: Element | null): string | null {
  if (!(node instanceof HTMLElement)) return 'no element to focus';
  try {
    node.focus();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function hoverTrigger(root: HTMLElement): void {
  mount(
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Helpful text</TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );
}

export function nativeFocusAlongsideControls(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  const onHoverCardOpenChange = spy<[boolean]>();
  const container = mount(
    <>
      <button data-testid="before" tabIndex={0}>
        Before
      </button>
      <Button data-testid="button-control">Button control</Button>
      <HoverCard onOpenChange={onHoverCardOpenChange}>
        <HoverCardTrigger>HoverCard control</HoverCardTrigger>
        <HoverCardContent>HoverCard content</HoverCardContent>
      </HoverCard>
      <Tooltip onOpenChange={onOpenChange}>
        <TooltipTrigger tabIndex={0}>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>,
    root
  );

  return {
    /** Focuses the first element matching `selector`; returns any throw. */
    focus: (selector: string) =>
      focusReportingError(container.querySelector(selector)),
    settle,
    openChanges: () => onOpenChange.calls,
    hoverCardOpenChanges: () => onHoverCardOpenChange.count(),
  };
}

export function keyboardTab(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  mount(
    <>
      <button data-testid="before" tabIndex={0}>
        Before
      </button>
      <Tooltip onOpenChange={onOpenChange}>
        <TooltipTrigger tabIndex={0}>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Helpful text</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>,
    root
  );

  return {
    settle,
    openChanges: () => onOpenChange.calls,
  };
}

export function controlledClosed(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  const container = mount(
    <Tooltip open={false} onOpenChange={onOpenChange}>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Helpful text</TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );
  const outside = document.createElement('button');
  outside.dataset.testid = 'outside-focus-target';
  outside.textContent = 'Outside';
  container.append(outside);

  return {
    focusTrigger: () =>
      focusReportingError(
        container.querySelector('[data-slot="tooltip-trigger"]')
      ),
    focusOutside: () => focusReportingError(outside),
    settle,
    openChanges: () => onOpenChange.count(),
  };
}

export function controlledClosedWithFocusChildren(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  const container = mount(
    <Tooltip open={false} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <div data-testid="tooltip-trigger" role="group" tabIndex={0}>
          <span data-testid="nested-focus-target" tabIndex={-1}>
            Nested focus target
          </span>
        </div>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Helpful text</TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );

  return {
    focusTrigger: () =>
      focusReportingError(
        container.querySelector('[data-testid="tooltip-trigger"]')
      ),
    focusNested: () =>
      focusReportingError(
        container.querySelector('[data-testid="nested-focus-target"]')
      ),
    settle,
    openChanges: () => onOpenChange.count(),
  };
}

export function controlledTriggerReplacement(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  let setTriggerMounted: ((mounted: boolean) => void) | undefined;
  function Fixture() {
    const triggerMounted = state(true);
    setTriggerMounted = triggerMounted.set;

    return (
      <>
        <button data-testid="outside">Outside</button>
        <Tooltip open={false} onOpenChange={onOpenChange}>
          {triggerMounted() ? (
            <TooltipTrigger data-testid="tooltip-trigger">
              Hover me
            </TooltipTrigger>
          ) : null}
          <TooltipPortal>
            <TooltipContent>Helpful text</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </>
    );
  }

  const container = mount(<Fixture />, root);
  return {
    removeTrigger: () => setTriggerMounted?.(false),
    focusOutside: () =>
      focusReportingError(container.querySelector('[data-testid="outside"]')),
    remountTrigger: () => setTriggerMounted?.(true),
    settle,
    openChanges: () => onOpenChange.count(),
  };
}

export function teardownDuringFocusAdoption(root: HTMLElement) {
  const originalRequest = window.requestAnimationFrame;
  const originalCancel = window.cancelAnimationFrame;
  const cancelled: number[] = [];
  const container = mount(
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Helpful text</TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );

  return {
    /**
     * Focuses the trigger while animation frames are held (every request
     * returns handle 73 and never runs), unmounts, and returns the handles
     * passed to `cancelAnimationFrame` during teardown.
     */
    focusThenUnmount: async () => {
      window.requestAnimationFrame = (() => 73) as typeof requestAnimationFrame;
      window.cancelAnimationFrame = ((handle: number) => {
        cancelled.push(handle);
      }) as typeof cancelAnimationFrame;
      try {
        (
          container.querySelector(
            '[data-slot="tooltip-trigger"]'
          ) as HTMLButtonElement
        ).focus();
        await Promise.resolve();
        await Promise.resolve();
        unmount(container);
        return [...cancelled];
      } finally {
        window.requestAnimationFrame = originalRequest;
        window.cancelAnimationFrame = originalCancel;
      }
    },
  };
}

/**
 * Fixed trigger and content boxes: the trigger spans (100,100)-(140,120) and
 * the content is 60x30, so `side="right" align="end" sideOffset={8}` places
 * the content at left 140 + 8 = 148px and top 120 - 30 = 90px.
 */
const POSITION_CSS = `
  #mount-root [data-slot="tooltip-trigger"] {
    position: fixed;
    left: 100px;
    top: 100px;
    width: 40px;
    height: 20px;
    margin: 0;
    padding: 0;
    border: 0;
    box-sizing: border-box;
  }
  [data-slot="tooltip-content"] {
    width: 60px;
    height: 30px;
    padding: 0;
    border: 0;
    box-sizing: border-box;
    overflow: hidden;
  }
`;

export function customPosition(root: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = POSITION_CSS;
  root.append(style);
  mount(
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent side="right" align="end" sideOffset={8}>
          Helpful text
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );
}
