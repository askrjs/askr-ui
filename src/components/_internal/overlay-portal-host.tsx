import { getSignal } from '@askrjs/askr';
import { readOptionalOverlayHost } from './overlay-host-context';
import type { OverlayPortal } from './overlay';

export function OverlayPortalHost(props: {
  portal: OverlayPortal;
  key?: string;
}) {
  const host = readOptionalOverlayHost();
  if (host) {
    host.register(props.portal, getSignal());
    return null;
  }

  const PortalHost = props.portal;
  return <PortalHost />;
}
