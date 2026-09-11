import { describe, expect, it } from 'vite-plus/test';
import {
  focusFirstDescendant,
  focusLastDescendant,
} from '../../../../src/components/_internal/focus/query';
import {
  claimOpenAutoFocus,
  focusSelectedCollectionItem,
} from '../../../../src/components/_internal/focus/composite';

describe('composite/collection item focus', () => {
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
