export interface SlotProps {
  asChild?: boolean;
  children?: any;
  [key: string]: any;
}

export function Slot(props: SlotProps) {
  const { asChild, children, ...rest } = props;

  // If asChild and child is an Element, merge props onto it and return it
  if (asChild && children && children instanceof Element) {
    const child = children as Element;

    // Apply props as attributes / event listeners / refs
    for (const k of Object.keys(rest)) {
      const v = rest[k];

      if (k === 'ref') {
        if (typeof v === 'function') {
          (v as Function)(child);
        } else if (v && typeof v === 'object') {
          (v as any).current = child;
        }
        continue;
      }

      if (k.startsWith('on') && typeof v === 'function') {
        const name = k.slice(2).toLowerCase();
        child.addEventListener(name, v as EventListener);
      } else if (v !== false && v != null) {
        try {
          if (k in child) {
            (child as any)[k] = v;
          } else {
            child.setAttribute(k, String(v));
          }
        } catch {
          child.setAttribute(k, String(v));
        }
      }
    }

    return child;
  }

  // Default render wrapper element
  return <span {...rest}>{children}</span>;
}
