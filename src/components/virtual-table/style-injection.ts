import {
  dynamicAttributeSelector,
  removeDynamicStyleRuleWhenUnused,
  setDynamicStyleRule,
} from '../_internal/dynamic-style';

/**
 * The subset of virtual table instance state that the DOM style-rule
 * injection helpers need: the CSP nonce to write rules under, and the
 * "committed" vs. "pending" layout rule maps used to diff what a render
 * still needs against what was previously injected.
 */
export type VirtualTableStyleHost = {
  layoutNonce: string | undefined;
  layoutRules: Map<string, string>;
  nextLayoutRules: Map<string, string>;
};

/**
 * Registers a dynamic CSS rule for one layout concern (e.g. row height,
 * column width) keyed by `kind`/`value`, and returns the data attribute
 * props that select it. Returns no props (and injects no rule) when
 * `value` is undefined.
 */
export function virtualTableLayoutProps(
  host: VirtualTableStyleHost,
  kind: string,
  value: string | undefined,
  declarations: Record<string, string | number | undefined>
): Record<string, string> {
  if (value === undefined) return {};
  const attribute = `data-askr-virtual-table-${kind}`;
  const key = `virtual-table:${kind}:${value}`;
  const selector = dynamicAttributeSelector(attribute, value);
  setDynamicStyleRule(key, selector, declarations, host.layoutNonce);
  host.nextLayoutRules.set(key, selector);
  return { [attribute]: value };
}

/**
 * Finalizes a render's layout rules: any rule that was active before this
 * render but was not re-requested (i.e. is not in `nextLayoutRules`) is
 * scheduled for removal once nothing in the DOM still references it, and
 * `nextLayoutRules` becomes the new committed set.
 */
export function commitVirtualTableLayoutRules(host: VirtualTableStyleHost) {
  for (const [key, selector] of host.layoutRules) {
    if (!host.nextLayoutRules.has(key)) {
      removeDynamicStyleRuleWhenUnused(key, selector);
    }
  }
  host.layoutRules = host.nextLayoutRules;
  host.nextLayoutRules = new Map();
}

/**
 * Schedules every currently committed layout rule for removal (once nothing
 * in the DOM still references it) and clears the committed set. Used when a
 * table instance unmounts (its root ref goes to null).
 */
export function clearVirtualTableLayoutRules(
  host: Pick<VirtualTableStyleHost, 'layoutRules'>
) {
  for (const [key, selector] of host.layoutRules) {
    removeDynamicStyleRuleWhenUnused(key, selector);
  }
  host.layoutRules.clear();
}
