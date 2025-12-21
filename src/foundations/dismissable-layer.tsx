export interface DismissableLayerProps {
  children?: any;
  onDismiss?: () => void;
  restoreFocus?: boolean;
}

export function DismissableLayer(props: DismissableLayerProps) {
  const { onDismiss, restoreFocus = true } = props;

  const el = document.createElement('div');

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (onDismiss) onDismiss();
    }
  }

  function onPointerDown(e: PointerEvent) {
    const target = e.target as Node | null;
    if (!el.contains(target)) {
      if (onDismiss) onDismiss();
    }
  }

  document.addEventListener('keydown', onKeyDown as EventListener);
  document.addEventListener('pointerdown', onPointerDown as EventListener);

  function unmount() {
    document.removeEventListener('keydown', onKeyDown as EventListener);
    document.removeEventListener('pointerdown', onPointerDown as EventListener);
  }

  (el as any).__dismissableUnmount = unmount;
  return el as any;
}
