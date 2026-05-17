import { bench, describe } from 'vite-plus/test';
import { VirtualList } from '../../src/components/virtual-list';

type Item = {
  id: string;
  label: string;
};

const items: Item[] = Array.from({ length: 100 }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index}`,
}));

describe('VirtualList benches', () => {
  bench('create virtual list', () => {
    <VirtualList
      aria-label="Items"
      items={items}
      rowHeight={24}
      getKey={(item) => item.id}
      rowComponent={({ item }) => <span>{item.label}</span>}
    />;
  });
});
