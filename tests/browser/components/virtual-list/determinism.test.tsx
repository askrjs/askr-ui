import { describe, it, vi } from 'vite-plus/test';
import { expectDeterministicRender } from '../../determinism';
import { VirtualList } from '../../../../src/components/virtual-list';

type Item = {
  id: string;
  label: string;
};

const items: Item[] = [
  { id: 'item-0', label: 'Item 0' },
  { id: 'item-1', label: 'Item 1' },
  { id: 'item-2', label: 'Item 2' },
];

describe('VirtualList - Determinism', () => {
  it('should renders deterministic virtual list markup', () => {
    vi.useFakeTimers();

    try {
      expectDeterministicRender(() => (
        <VirtualList
          aria-label="Items"
          style={{ height: '60px', overflowY: 'auto' }}
          items={items}
          rowHeight={20}
          getKey={(item) => item.id}
          rowComponent={({ item }) => <span>{item.label}</span>}
        />
      ));
    } finally {
      vi.useRealTimers();
    }
  });
});
