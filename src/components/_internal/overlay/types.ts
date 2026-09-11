export type OverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayPortal = {
  (): JSX.Element | null;
  render(props: { children?: unknown }): JSX.Element | null;
};
export type OverlayIdentity = object;

export function createOverlayIdentity(): OverlayIdentity {
  return {};
}
