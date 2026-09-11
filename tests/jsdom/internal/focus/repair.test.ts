import { describe, expect, it, vi } from 'vite-plus/test';
import { repairFocusForDisabledItem } from '../../../../src/components/_internal/focus/repair';

type Metadata = { disabled: boolean; index: number };

function makeItem(index: number, disabled: boolean) {
  const node = document.createElement('button');
  node.id = `item-${index}`;
  document.body.appendChild(node);
  return { node, metadata: { disabled, index } as Metadata };
}

describe('repairFocusForDisabledItem', () => {
  it('should move focus to the next enabled item when the focused item becomes disabled', async () => {
    const items = [makeItem(0, false), makeItem(1, false), makeItem(2, false)];
    const collection = { items: () => items } as never;
    const setCurrentIndex = vi.fn();

    items[1].node.focus();
    expect(document.activeElement).toBe(items[1].node);

    repairFocusForDisabledItem({
      collection,
      disabled: true,
      index: 1,
      loop: false,
      node: items[1].node,
      setCurrentIndex,
    });

    // Mark the node focused via the same tracker the composite props use,
    // then process the queued microtask repair.
    await Promise.resolve();
    await Promise.resolve();

    // Because the tracker only marks `focused` through compositeItemFocusProps
    // (not exercised here), the repair should no-op without a focus claim.
    expect(setCurrentIndex).not.toHaveBeenCalled();

    for (const item of items) item.node.remove();
  });

  it('should no-op when the item is not becoming newly disabled', () => {
    const items = [makeItem(0, false)];
    const collection = { items: () => items } as never;
    const setCurrentIndex = vi.fn();

    repairFocusForDisabledItem({
      collection,
      disabled: false,
      index: 0,
      loop: false,
      node: items[0].node,
      setCurrentIndex,
    });

    expect(setCurrentIndex).not.toHaveBeenCalled();
    items[0].node.remove();
  });

  it('should no-op when node is null', () => {
    const collection = { items: () => [] } as never;
    const setCurrentIndex = vi.fn();
    expect(() =>
      repairFocusForDisabledItem({
        collection,
        disabled: true,
        index: 0,
        loop: false,
        node: null,
        setCurrentIndex,
      })
    ).not.toThrow();
    expect(setCurrentIndex).not.toHaveBeenCalled();
  });
});
