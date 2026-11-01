import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
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
  registerBench(
    'SSR render virtual list',
    () => {
      renderToStringSync(() => (
        <VirtualList
          aria-label="Items"
          items={items}
          rowHeight={24}
          getKey={(item) => item.id}
          rowComponent={({ item }) => <span>{item.label}</span>}
        />
      ));
    },
    { throws: true }
  );
});
