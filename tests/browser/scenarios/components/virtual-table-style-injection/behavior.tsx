import {
  clearVirtualTableLayoutRules,
  commitVirtualTableLayoutRules,
  virtualTableLayoutProps,
  type VirtualTableStyleHost,
} from '../../../../../src/components/virtual-table/style-injection';

function createHost(): VirtualTableStyleHost {
  return {
    layoutNonce: undefined,
    layoutRules: new Map(),
    nextLayoutRules: new Map(),
  };
}

export function undefinedValue() {
  const host = createHost();

  const props = virtualTableLayoutProps(host, 'row-height', undefined, {
    height: '10px',
  });

  return {
    result: () => ({
      props: { ...props },
      nextRuleCount: host.nextLayoutRules.size,
    }),
  };
}

export function injectedRule() {
  const host = createHost();

  const props = virtualTableLayoutProps(host, 'row-height', '32', {
    height: '32px',
  });

  return {
    result: () => ({
      props: { ...props },
      nextRuleCount: host.nextLayoutRules.size,
    }),
    committedHeight: () => {
      const target = document.createElement('tr');
      target.setAttribute('data-askr-virtual-table-row-height', '32');
      document.body.appendChild(target);

      try {
        commitVirtualTableLayoutRules(host);

        return getComputedStyle(target).height;
      } finally {
        target.remove();
      }
    },
  };
}

export function unusedRuleRemoval() {
  const host = createHost();

  virtualTableLayoutProps(host, 'row-height', '20', { height: '20px' });
  commitVirtualTableLayoutRules(host);

  const afterFirstCommit = host.layoutRules.size;

  // Nothing referenced this render, so the previously active rule should be
  // scheduled for removal once nothing in the DOM still uses it.
  commitVirtualTableLayoutRules(host);

  return {
    result: () => ({
      afterFirstCommit,
      afterSecondCommit: host.layoutRules.size,
    }),
  };
}

export function unmountCleanup() {
  const host = createHost();

  virtualTableLayoutProps(host, 'row-height', '12', { height: '12px' });
  commitVirtualTableLayoutRules(host);

  const afterCommit = host.layoutRules.size;

  clearVirtualTableLayoutRules(host);

  return {
    result: () => ({ afterCommit, afterClear: host.layoutRules.size }),
  };
}
