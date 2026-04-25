/**
 * createLayer
 *
 * Manages stacking order and coordination for overlays (modals, popovers, etc).
 */

export interface LayerOptions {
  onEscape?: () => void;
  onOutsidePointer?: (e: PointerEvent) => void;
  node?: Node | null;
}

export interface Layer {
  id: number;
  isTop(): boolean;
  unregister(): void;
}

export interface LayerManager {
  register(options: LayerOptions): Layer;
  layers(): ReadonlyArray<Layer>;
  handleEscape(): void;
  handleOutsidePointer(e: PointerEvent): void;
}

export function createLayer(): LayerManager {
  const stack: Array<{
    id: number;
    options: LayerOptions;
  }> = [];

  let nextId = 1;

  function register(options: LayerOptions): Layer {
    const id = nextId++;
    const entry = { id, options };
    stack.push(entry);

    function isTop(): boolean {
      return stack[stack.length - 1]?.id === id;
    }

    function unregister(): void {
      const index = stack.findIndex((e) => e.id === id);
      if (index !== -1) {
        stack.splice(index, 1);
      }
    }

    return {
      id,
      isTop,
      unregister,
    };
  }

  function layers(): ReadonlyArray<Layer> {
    return stack.map((entry) => ({
      id: entry.id,
      isTop: () => stack[stack.length - 1]?.id === entry.id,
      unregister: () => {
        const index = stack.findIndex((e) => e.id === entry.id);
        if (index !== -1) {
          stack.splice(index, 1);
        }
      },
    }));
  }

  function handleEscape(): void {
    const top = stack[stack.length - 1];
    if (top) {
      top.options.onEscape?.();
    }
  }

  function handleOutsidePointer(e: PointerEvent): void {
    const top = stack[stack.length - 1];
    if (!top) return;

    const node = top.options.node;
    if (node && e.target instanceof Node) {
      if (!node.contains(e.target)) {
        top.options.onOutsidePointer?.(e);
      }
    } else {
      top.options.onOutsidePointer?.(e);
    }
  }

  return {
    register,
    layers,
    handleEscape,
    handleOutsidePointer,
  };
}
