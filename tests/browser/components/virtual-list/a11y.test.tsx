import { describe, it } from 'vite-plus/test';
import { expectNoAxeViolations } from '../../accessibility';
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

describe('VirtualList - Accessibility', () => {
  it('should has no automated axe violations for a semantic virtual list', async () => {
    await expectNoAxeViolations(
      <VirtualList
        aria-label="Items"
        style={{ height: '60px', overflowY: 'auto' }}
        items={items}
        rowHeight={20}
        getKey={(item) => item.id}
        rowComponent={({ item }) => <span>{item.label}</span>}
      />
    );
  });
});
