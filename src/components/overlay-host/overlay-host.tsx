import { For, getSignal, state } from '@askrjs/askr';
import type { OverlayPortal } from '../_internal/overlay';
import {
  OverlayHostContext,
  type OverlayHostContextValue,
  type OverlayHostRegistration,
} from '../_internal/overlay-host-context';

const portalKeys = new WeakMap<OverlayPortal, string>();
let nextPortalKey = 0;

function keyForPortal(portal: OverlayPortal): string {
  const existing = portalKeys.get(portal);
  if (existing) return existing;
  const created = `overlay-portal-${nextPortalKey++}`;
  portalKeys.set(portal, created);
  return created;
}

function OverlayPortalRegistrationView(props: {
  registration: OverlayHostRegistration;
  key?: string;
}) {
  const PortalHost = props.registration.portal;
  return <PortalHost />;
}

function OverlayHostViewport(props: {
  getRegistrations: () => readonly OverlayHostRegistration[];
}) {
  return (
    <For each={props.getRegistrations} by={(registration) => registration.key}>
      {(registration) => (
        <OverlayPortalRegistrationView
          key={registration.key}
          registration={registration}
        />
      )}
    </For>
  );
}

export type OverlayHostProps = { children?: unknown };

export function OverlayHost(props: OverlayHostProps) {
  const registrations = state<readonly OverlayHostRegistration[]>([]);
  const activeRegistrations = state(
    new Map<OverlayPortal, OverlayHostRegistration>()
  )();
  const pendingRegistrations = state(new Map<OverlayPortal, AbortSignal>())();
  const hostSignal = getSignal();
  const context: OverlayHostContextValue = {
    getRegistrations: registrations,
    register: (portal, signal) => {
      if (activeRegistrations.has(portal) || pendingRegistrations.has(portal)) {
        return;
      }

      pendingRegistrations.set(portal, signal);
      queueMicrotask(() => {
        pendingRegistrations.delete(portal);
        if (hostSignal.aborted || signal.aborted) return;
        const registration = { key: keyForPortal(portal), portal, signal };
        activeRegistrations.set(portal, registration);
        registrations.set([...activeRegistrations.values()]);
      });
      signal.addEventListener(
        'abort',
        () => {
          pendingRegistrations.delete(portal);
          const current = activeRegistrations.get(portal);
          if (!current || current.signal !== signal) return;
          activeRegistrations.delete(portal);
          if (!hostSignal.aborted) {
            registrations.set([...activeRegistrations.values()]);
          }
        },
        { once: true }
      );
    },
  };

  return (
    <OverlayHostContext value={context}>
      <>
        {props.children}
        <OverlayHostViewport getRegistrations={registrations} />
      </>
    </OverlayHostContext>
  );
}
