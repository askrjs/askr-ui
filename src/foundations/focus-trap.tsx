import { FocusScope } from './focus-scope';

export interface FocusTrapProps {
  children?: any;
  onDismiss?: () => void;
}

export function FocusTrap(props: FocusTrapProps) {
  const { onDismiss } = props;

  const scope = FocusScope({ contain: true, restoreFocus: true });

  const el = document.createElement('div');
  el.appendChild(scope as any);

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
    if ((scope as any).__focusScopeUnmount) (scope as any).__focusScopeUnmount();
  }

  (el as any).__focusTrapUnmount = unmount;
  return el as any;
}
