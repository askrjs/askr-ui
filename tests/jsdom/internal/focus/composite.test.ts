import { describe, expect, it } from 'vite-plus/test';
import {
  focusFirstDescendant,
  focusLastDescendant,
} from '../../../../src/components/_internal/focus/query';
import {
  claimOpenAutoFocus,
  focusSelectedCollectionItem,
  restorePendingCollectionItemFocus,
} from '../../../../src/components/_internal/focus/composite';

describe('composite/collection item focus', () => {
  it('should preserve an external focus transition while a pending item ref reattaches during blur', async () => {
    const item = document.createElement('button');
    const outside = document.createElement('button');
    document.body.append(item, outside);
    const pending = { index: 1 as number | null };
    try {
      item.focus();
      item.addEventListener(
        'blur',
        () => {
          restorePendingCollectionItemFocus(pending, 1, item);
        },
        { once: true }
      );

      outside.focus();
      await Promise.resolve();

      expect(document.activeElement).toBe(outside);
      expect(pending.index).toBeNull();
    } finally {
      item.remove();
      outside.remove();
    }
  });

  it('should restore a pending replacement item after its ref attaches from body focus', async () => {
    const replacement = document.createElement('button');
    const pending = { index: 1 as number | null };
    restorePendingCollectionItemFocus(pending, 1, replacement);
    document.body.append(replacement);

    await Promise.resolve();

    expect(document.activeElement).toBe(replacement);
    replacement.remove();
  });

  it('should retain a pending focus claim when a descendant owns focus', async () => {
    const item = document.createElement('div');
    item.tabIndex = -1;
    const child = document.createElement('button');
    item.append(child);
    document.body.append(item);
    const pending = { index: 1 as number | null };
    try {
      child.focus();
      restorePendingCollectionItemFocus(pending, 1, item);
      await Promise.resolve();

      expect(pending.index).toBe(1);
      expect(document.activeElement).toBe(item);
    } finally {
      item.remove();
    }
  });

  it('should focus the first and last focusable descendants', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button id="a">a</button>
      <button id="b">b</button>
      <button id="c">c</button>
    `;
    document.body.appendChild(root);

    expect(focusFirstDescendant(root)).toBe(true);
    expect(document.activeElement?.id).toBe('a');

    expect(focusLastDescendant(root)).toBe(true);
    expect(document.activeElement?.id).toBe('c');

    root.remove();
  });

  it('should return false when there is nothing focusable', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    expect(focusFirstDescendant(root)).toBe(false);
    expect(focusLastDescendant(root)).toBe(false);
    root.remove();
  });

  it('should focus a matching collection item by metadata index', () => {
    const node = document.createElement('button');
    document.body.appendChild(node);
    const collection = {
      items: () => [{ node, metadata: { index: 3 } }],
    } as never;

    expect(focusSelectedCollectionItem(collection, 3)).toBe(true);
    expect(document.activeElement).toBe(node);
    expect(focusSelectedCollectionItem(collection, 4)).toBe(false);

    node.remove();
  });

  it('should claim open-auto-focus once per open node and release it on close', () => {
    const identity = {};
    const node = document.createElement('button');

    expect(claimOpenAutoFocus(identity, true, node)).toBe(true);
    expect(claimOpenAutoFocus(identity, true, node)).toBe(false);

    expect(claimOpenAutoFocus(identity, false, node)).toBe(false);
    expect(claimOpenAutoFocus(identity, true, node)).toBe(true);
  });
});
