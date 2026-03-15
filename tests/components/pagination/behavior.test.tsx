import { describe, expect, it } from 'vitest';
import { Pagination } from '../../../src/components/pagination';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Pagination - Behavior', () => {
  it('should render ellipses and advance current page', async () => {
    const container = mount(<Pagination count={10} defaultPage={5} />);

    try {
      expect(
        container.querySelectorAll('[data-pagination-ellipsis="true"]').length
      ).toBe(2);

      let current = container.querySelector('[aria-current="page"]') as HTMLButtonElement;
      expect(current.textContent).toBe('5');

      const next = container.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
      next.click();
      await flushUpdates();

      current = container.querySelector('[aria-current="page"]') as HTMLButtonElement;
      expect(current.textContent).toBe('6');
    } finally {
      unmount(container);
    }
  });
});
