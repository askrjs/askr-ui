import { state } from '@askrjs/askr';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../../../src/components/hover-card';
import { flushUpdates, mount, settle, spy, unmount } from '../../_mount';

export function ancestorCanceledTab(root: HTMLElement): void {
  document.addEventListener('keydown', (event) => event.preventDefault(), {
    capture: true,
  });
  mount(
    <HoverCard defaultOpen>
      <HoverCardTrigger tabIndex={0}>Preview</HoverCardTrigger>
      <HoverCardContent>
        <button data-testid="first" tabIndex={0}>
          First
        </button>
        <button data-testid="last" tabIndex={0}>
          Last
        </button>
      </HoverCardContent>
    </HoverCard>,
    root
  );
}

/**
 * A 2px target pinned to the viewport's bottom-right corner, outside every
 * hover card part. Hovering it is how a spec moves the real pointer "away".
 */
function addPointerExitTarget(root: HTMLElement): void {
  const target = document.createElement('button');
  target.setAttribute('data-hover-card-pointer-exit', 'true');
  target.style.position = 'fixed';
  target.style.right = '0';
  target.style.bottom = '0';
  target.style.width = '2px';
  target.style.height = '2px';
  target.style.zIndex = '2147483647';
  root.append(target);
}

export function hoverAndFocus(root: HTMLElement) {
  addPointerExitTarget(root);
  const onOpenChange = spy<[boolean]>();
  mount(
    <HoverCard onOpenChange={onOpenChange}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );

  return { openChanges: () => onOpenChange.calls };
}

export function disabledFocusTrigger(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  mount(
    <HoverCard onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild disabled>
        <div tabIndex={0}>Disabled preview</div>
      </HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );
  return { openChanges: () => onOpenChange.calls };
}

export function asChildRefs(root: HTMLElement) {
  const triggerRef = { current: null as HTMLAnchorElement | null };
  const contentRef = { current: null as HTMLElement | null };
  const container = mount(
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild ref={triggerRef}>
        <a href="/preview">Preview</a>
      </HoverCardTrigger>
      <HoverCardContent asChild ref={contentRef}>
        <section>Details</section>
      </HoverCardContent>
    </HoverCard>,
    root
  );

  return {
    refs: () => ({
      triggerIsAnchor:
        triggerRef.current !== null &&
        triggerRef.current === container.querySelector('a'),
      contentIsSection:
        contentRef.current !== null &&
        contentRef.current ===
          document.body.querySelector(
            'section[data-slot="hover-card-content"]'
          ),
    }),
  };
}

export function controlledClosed(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  const container = mount(
    <HoverCard open={false} onOpenChange={onOpenChange}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );

  return {
    /** Dispatches the synthetic bubbling `focus` event the contract names. */
    dispatchFocus: async () => {
      container
        .querySelector('[data-slot="hover-card-trigger"]')
        ?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      await flushUpdates();
    },
    openChanges: () => onOpenChange.calls,
  };
}

export function openWithCloseDelay(root: HTMLElement): void {
  addPointerExitTarget(root);
  mount(
    <HoverCard defaultOpen closeDelay={50}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );
}

export function immediateLeave(root: HTMLElement) {
  addPointerExitTarget(root);
  const onOpenChange = spy<[boolean]>();
  mount(
    <HoverCard openDelay={100} closeDelay={90} onOpenChange={onOpenChange}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );

  return { openChanges: () => onOpenChange.count() };
}

export function rerenderWhilePending(root: HTMLElement) {
  addPointerExitTarget(root);
  let rerender = () => undefined as void;
  const onOpenChange = spy<[boolean]>();
  function Fixture() {
    const revision = state(0);
    rerender = () => revision.set((value) => value + 1);
    return (
      <div data-revision={revision()}>
        <HoverCard openDelay={100} onOpenChange={onOpenChange}>
          <HoverCardTrigger>Preview</HoverCardTrigger>
          <HoverCardContent>Details</HoverCardContent>
        </HoverCard>
      </div>
    );
  }
  mount(<Fixture />, root);

  return {
    rerender: async () => {
      rerender();
      await flushUpdates();
    },
    openChanges: () => onOpenChange.count(),
  };
}

export function reenterBeforeClose(root: HTMLElement): void {
  addPointerExitTarget(root);
  mount(
    <HoverCard defaultOpen closeDelay={90}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );
}

export function timerChurn(root: HTMLElement) {
  addPointerExitTarget(root);
  const onOpenChange = spy<[boolean]>();
  mount(
    <HoverCard openDelay={20} closeDelay={90} onOpenChange={onOpenChange}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );

  return { openChanges: () => onOpenChange.calls };
}

export function teardownWithPendingTimers(root: HTMLElement) {
  const onOpenChange = spy<[boolean]>();
  const container = mount(
    <HoverCard openDelay={50} closeDelay={50} onOpenChange={onOpenChange}>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );

  return {
    unmount: () => unmount(container),
    openChanges: () => onOpenChange.count(),
  };
}

export function openLabeling(root: HTMLElement): void {
  mount(
    <HoverCard defaultOpen>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>Details</HoverCardContent>
    </HoverCard>,
    root
  );
}

export function interactiveContent(root: HTMLElement) {
  const container = mount(
    <>
      <button data-testid="before">Before</button>
      <HoverCard>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>
          <a href="/first">First</a>
          <button>Last</button>
        </HoverCardContent>
      </HoverCard>
      <button data-testid="after">After</button>
    </>,
    root
  );
  const trigger = () =>
    container.querySelector('[data-slot="hover-card-trigger"]') as HTMLElement;

  return {
    /** Dispatches a synthetic bubbling `focus` event on the trigger. */
    dispatchTriggerFocus: async () => {
      trigger().dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      await settle();
    },
  };
}

export function throttledRestorationFrame(root: HTMLElement) {
  const container = mount(
    <HoverCard defaultOpen>
      <HoverCardTrigger>Preview</HoverCardTrigger>
      <HoverCardContent>
        <button>Action</button>
      </HoverCardContent>
    </HoverCard>,
    root
  );
  const originalRequest = window.requestAnimationFrame;
  let frameRequests = 0;

  return {
    /**
     * Holds every animation frame (each request returns 1 and never runs),
     * then focuses the content action and presses Escape on it.
     */
    escapeWithThrottledFrames: async () => {
      window.requestAnimationFrame = (() => {
        frameRequests += 1;
        return 1;
      }) as typeof requestAnimationFrame;
      const action = document.body.querySelector(
        '[data-slot="hover-card-content"] button'
      ) as HTMLButtonElement;
      action.focus();
      action.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
      await flushUpdates();
      return frameRequests;
    },
    contentOpen: () =>
      document.body.querySelector('[data-slot="hover-card-content"]') !== null,
    dispatchTriggerFocus: async () => {
      container
        .querySelector('[data-slot="hover-card-trigger"]')
        ?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      await flushUpdates();
    },
    restoreFrames: () => {
      window.requestAnimationFrame = originalRequest;
    },
  };
}

export function partIdentityAssociations(
  root: HTMLElement,
  options?: { part?: 'trigger' | 'content'; callerAria?: boolean } | null
): void {
  mount(
    <HoverCard open>
      <HoverCardTrigger
        id={
          options?.part === 'trigger' || options?.callerAria
            ? 'custom-hover-card-trigger'
            : undefined
        }
        aria-controls={
          options?.callerAria ? 'caller-hover-card-target' : undefined
        }
      >
        Preview
      </HoverCardTrigger>
      <HoverCardContent
        id={
          options?.part === 'content' || options?.callerAria
            ? 'custom-hover-card-content'
            : undefined
        }
        aria-labelledby={
          options?.callerAria ? 'caller-hover-card-label' : undefined
        }
      >
        Details
      </HoverCardContent>
    </HoverCard>,
    root
  );
}

export function reactivePartIdentityAssociations(
  root: HTMLElement,
  options?: { callerAria?: boolean } | null
) {
  let suffix!: ReturnType<typeof state<string>>;
  let triggerReads = 0;
  let contentReads = 0;
  function Fixture() {
    suffix = state('initial');
    return (
      <HoverCard open>
        <HoverCardTrigger
          id={() => {
            triggerReads++;
            return `reactive-hover-card-trigger-${suffix()}`;
          }}
          aria-controls={
            options?.callerAria ? 'caller-hover-card-target' : undefined
          }
        >
          Preview
        </HoverCardTrigger>
        <HoverCardContent
          id={() => {
            contentReads++;
            return `reactive-hover-card-content-${suffix()}`;
          }}
          aria-labelledby={
            options?.callerAria ? 'caller-hover-card-label' : undefined
          }
        >
          Details
        </HoverCardContent>
      </HoverCard>
    );
  }
  mount(<Fixture />, root);
  return {
    reads: () => ({ trigger: triggerReads, content: contentReads }),
    update: async () => {
      suffix.set('updated');
      await flushUpdates();
    },
  };
}
