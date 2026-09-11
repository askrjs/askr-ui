import { expect, test } from '../../fixtures';

test.describe('ToggleGroup - Accessibility', () => {
  test('should have no automated axe violations for native toggle group items', async ({
    render,
    axeViolations,
  }) => {
    await render('axeNativeItems');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for labelled asChild items', async ({
    render,
    axeViolations,
  }) => {
    await render('axeAsChildItems');

    expect(await axeViolations()).toEqual([]);
  });

  test('should use group semantics and pressed state for native items', async ({
    render,
    root,
    run,
  }) => {
    await render('nativeSemantics');
    const contract = await run<{ GROUP_ROLE: string }>('contract');
    const group = root.locator('[data-slot="toggle-group"]');

    await expect(group).toHaveAttribute('role', contract.GROUP_ROLE);
    await expect(group).toHaveAttribute('aria-label', 'Text alignment');
    expect(
      await root
        .locator('[data-slot="toggle-group-item"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('aria-pressed'))
        )
    ).toEqual(['true', 'false']);
  });

  test('should use button semantics for asChild items', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildSemantics');
    const contract = await run<{ ITEM_ROLE: string }>('contract');
    const host = root.locator('[data-slot="toggle-group-item"]');

    await expect(host).toHaveAttribute('role', contract.ITEM_ROLE);
    await expect(host).toHaveAttribute('aria-pressed', 'true');
  });

  test('should use disabled semantics for asChild items without native button support', async ({
    render,
    root,
  }) => {
    await render('asChildDisabled');
    const host = root.locator('[data-slot="toggle-group-item"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
  });

  test('should match the documented toggle group accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');

    expect(await run<Record<string, unknown>>('contract')).toEqual({
      GROUP_ROLE: 'group',
      ITEM_ROLE: 'button',
      PRESSED_ATTRIBUTE: 'aria-pressed',
      DATA_ATTRIBUTES: {
        slot: 'data-slot',
        state: 'data-state',
        disabled: 'data-disabled',
        orientation: 'data-orientation',
      },
    });
  });
});
