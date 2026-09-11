import { describe, expect, it } from 'vite-plus/test';
import {
  commitVirtualTableLayoutRules,
  virtualTableLayoutProps,
  type VirtualTableStyleHost,
} from '../../../../src/components/virtual-table/style-injection';

function createHost(): VirtualTableStyleHost {
  return {
    layoutNonce: undefined,
    layoutRules: new Map(),
    nextLayoutRules: new Map(),
  };
}

describe('virtual table style injection', () => {
  it('returns no attribute and injects no rule when the value is undefined', () => {
    const host = createHost();

    const props = virtualTableLayoutProps(host, 'row-height', undefined, {
      height: '10px',
    });

    expect(props).toEqual({});
    expect(host.nextLayoutRules.size).toBe(0);
  });

  it('injects a dynamic style rule and returns the matching data attribute', () => {
    const host = createHost();

    const props = virtualTableLayoutProps(host, 'row-height', '32', {
      height: '32px',
    });

    expect(props).toEqual({ 'data-askr-virtual-table-row-height': '32' });
    expect(host.nextLayoutRules.size).toBe(1);

    const target = document.createElement('tr');
    target.setAttribute('data-askr-virtual-table-row-height', '32');
    document.body.appendChild(target);

    try {
      commitVirtualTableLayoutRules(host);

      expect(getComputedStyle(target).height).toBe('32px');
    } finally {
      target.remove();
    }
  });

  it('removes rules that are no longer used after committing', async () => {
    const host = createHost();

    virtualTableLayoutProps(host, 'row-height', '20', { height: '20px' });
    commitVirtualTableLayoutRules(host);

    expect(host.layoutRules.size).toBe(1);

    // Nothing referenced this render, so the previously active rule should be
    // scheduled for removal once nothing in the DOM still uses it.
    commitVirtualTableLayoutRules(host);

    expect(host.layoutRules.size).toBe(0);
  });
});
