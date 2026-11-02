import { OverlayHost } from '../../../../../src/components/overlay-host';
import { readOptionalOverlayHost } from '../../../../../src/components/_internal/overlay-host-context';
import type { OverlayPortal } from '../../../../../src/components/_internal/overlay';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { flushUpdates, mount, unmount } from '../../_mount';

export async function stalePendingRegistration(root: HTMLElement) {
  let host: ReturnType<typeof readOptionalOverlayHost>;
  function CaptureHost() {
    host = readOptionalOverlayHost();
    return null;
  }
  mount(
    <OverlayHost>
      <CaptureHost />
    </OverlayHost>,
    root
  );
  await flushUpdates();

  if (!host) throw new Error('Expected the OverlayHost context');
  const portal = Object.assign(() => null, {
    render: () => null,
  }) as OverlayPortal;
  const aborted = new AbortController();
  const active = new AbortController();
  const unrelated = new AbortController();

  host.register(portal, aborted.signal);
  queueMicrotask(() => host?.register(portal, unrelated.signal));
  aborted.abort();
  host.register(portal, active.signal);
  await flushUpdates();
  await flushUpdates();

  unrelated.abort();
  await flushUpdates();
  await flushUpdates();

  return {
    activeRegistrationCount: () => host?.getRegistrations().length ?? 0,
  };
}

export async function manyIndependentRegistrations(root: HTMLElement) {
  const hosts: {
    twoHundredFifty: ReturnType<typeof readOptionalOverlayHost>;
    oneThousand: ReturnType<typeof readOptionalOverlayHost>;
  } = { twoHundredFifty: null, oneThousand: null };
  function CaptureHost(props: {
    save: (host: ReturnType<typeof readOptionalOverlayHost>) => void;
  }) {
    props.save(readOptionalOverlayHost());
    return null;
  }
  mount(
    <>
      <OverlayHost>
        <CaptureHost save={(host) => (hosts.twoHundredFifty = host)} />
      </OverlayHost>
      <OverlayHost>
        <CaptureHost save={(host) => (hosts.oneThousand = host)} />
      </OverlayHost>
    </>,
    root
  );
  await flushUpdates();
  const twoHundredFiftyHost = hosts.twoHundredFifty;
  const oneThousandHost = hosts.oneThousand;
  if (!twoHundredFiftyHost || !oneThousandHost) {
    throw new Error('Expected both OverlayHost contexts');
  }

  const registerMany = async (
    host: NonNullable<ReturnType<typeof readOptionalOverlayHost>>,
    count: number
  ) => {
    const portals = Array.from(
      { length: count },
      () => Object.assign(() => null, { render: () => null }) as OverlayPortal
    );
    const signals = Array.from(
      { length: count },
      () => new AbortController().signal
    );
    for (let index = 0; index < count; index++) {
      const portal = portals[index];
      const signal = signals[index];
      if (portal && signal) host?.register(portal, signal);
    }
    await flushUpdates();
    await flushUpdates();
  };

  await registerMany(twoHundredFiftyHost, 250);
  await registerMany(oneThousandHost, 1000);
  return {
    registrationCount: () => ({
      twoHundredFifty: twoHundredFiftyHost.getRegistrations().length,
      oneThousand: oneThousandHost.getRegistrations().length,
    }),
  };
}

export async function independentPortalChannels(root: HTMLElement) {
  mount(
    <OverlayHost>
      <Popover defaultOpen>
        <PopoverTrigger>First trigger</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="First overlay">
            First
            <PopoverClose>Close first</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      <Popover defaultOpen>
        <PopoverTrigger>Second trigger</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="Second overlay">Second</PopoverContent>
        </PopoverPortal>
      </Popover>
    </OverlayHost>,
    root
  );

  await flushUpdates();
  await flushUpdates();

  return {
    contentCount: () =>
      document.body.querySelectorAll('[data-slot="popover-content"]').length,
    closeFirst: async () => {
      (
        document.body.querySelector(
          '[data-slot="popover-close"]'
        ) as HTMLElement
      ).click();
      await flushUpdates();
      await flushUpdates();
    },
    overlays: () => ({
      first:
        document.body.querySelector('[aria-label="First overlay"]') !== null,
      second:
        document.body.querySelector('[aria-label="Second overlay"]') !== null,
    }),
  };
}

export async function hostUnmount(root: HTMLElement) {
  const container = mount(
    <OverlayHost>
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>Hosted content</PopoverContent>
        </PopoverPortal>
      </Popover>
    </OverlayHost>,
    root
  );

  await flushUpdates();
  await flushUpdates();

  return {
    hasHostedContent: () =>
      document.body.querySelector('[data-slot="popover-content"]') !== null,
    unmountHost: () => {
      unmount(container);
    },
    mountReplacement: () => {
      mount(<div>Replacement application</div>);
    },
  };
}
