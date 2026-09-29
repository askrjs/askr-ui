import { expect, test } from '../../fixtures';

const MODES = ['map', 'for'] as const;

interface Controls {
  alpha: string | null;
  beta: string | null;
}

test.describe('dynamic children context contract', () => {
  test('should support mapped and For-rendered Accordion items', async ({
    render,
    root,
  }) => {
    await render('accordionItems');

    for (const mode of MODES) {
      await root
        .getByRole('button', { name: `Two ${mode}`, exact: true })
        .click();
    }

    for (const mode of MODES) {
      await expect(
        root.getByRole('button', { name: `Two ${mode}`, exact: true })
      ).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('should support mapped and For-rendered RadioGroup items', async ({
    render,
    root,
  }) => {
    await render('radioGroupItems');

    for (const mode of MODES) {
      await root
        .getByRole('radio', { name: `Two ${mode}`, exact: true })
        .click();
    }

    for (const mode of MODES) {
      await expect(
        root.getByRole('radio', { name: `Two ${mode}`, exact: true })
      ).toHaveAttribute('aria-checked', 'true');
    }
  });

  test('should support mapped and For-rendered Menu items', async ({
    render,
    root,
  }) => {
    await render('menuItems');

    for (const mode of MODES) {
      const items = root
        .locator('[role="menuitem"]')
        .filter({ hasText: new RegExp(`${mode}$`) });
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
      await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');
    }
  });

  test('should support mapped and For-rendered Dropdown items', async ({
    render,
    root,
  }) => {
    await render('dropdownItems');

    for (const mode of MODES) {
      const items = root
        .locator('[role="menuitem"]')
        .filter({ hasText: new RegExp(`${mode}$`) });
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
      await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');
    }
  });

  test('should support mapped and For-rendered Select items', async ({
    render,
    root,
    run,
  }) => {
    await render('selectItems');

    await run('clickTwoOptions');

    for (const mode of MODES) {
      await expect(root.locator(`input[name="${mode}"]`)).toHaveValue('two');
    }
  });

  test('should support mapped and For-rendered Menubar menus and items', async ({
    render,
    run,
  }) => {
    await render('menubarMenusAndItems');

    await run('clickTwoTriggers');

    expect(
      await run<
        Array<{
          mode: string;
          triggers: number;
          actions: number;
          hasOneOneAction: boolean;
        }>
      >('report')
    ).toEqual(
      MODES.map((mode) => ({
        mode,
        triggers: 2,
        actions: 2,
        hasOneOneAction: false,
      }))
    );
  });

  test('should preserve mapped and For-rendered Accordion identity across reorder and clear/refill', async ({
    render,
    root,
    run,
  }) => {
    for (const mode of MODES) {
      await test.step(mode, async () => {
        await render('accordionIdentity', { mode });

        const { alpha: alphaControls, beta: betaControls } =
          await run<Controls>('controls');

        expect(betaControls).toBeTruthy();
        expect(alphaControls).toBeTruthy();
        expect(betaControls).not.toBe(alphaControls);

        await root
          .getByRole('button', { name: `Beta ${mode}`, exact: true })
          .click();

        await expect(root).toContainText(`Beta content ${mode}`);

        await run('reorderAndAppend');

        expect(await run<Controls>('controls')).toEqual({
          alpha: alphaControls,
          beta: betaControls,
        });
        expect(await run<number>('countById', betaControls)).toBe(1);
        expect(await run<string>('text')).toContain(`Beta content ${mode}`);

        await run('clear');

        const cleared = await run<string>('text');
        expect(cleared).not.toContain('Beta content');
        expect(cleared).not.toContain('Gamma content');

        await run('refill');

        expect(await run<Controls>('controls')).toEqual({
          alpha: alphaControls,
          beta: betaControls,
        });
        expect(await run<string>('text')).toContain(`Beta content ${mode}`);
      });
    }
  });

  test('should preserve static siblings while mapped and For-rendered Dropdown items re-shuffle', async ({
    render,
    run,
  }) => {
    for (const mode of MODES) {
      await test.step(mode, async () => {
        await render('dropdownReshuffle', { mode });

        expect(await run<boolean>('hasTrigger')).toBe(true);
        expect(await run('siblings')).toEqual({
          prefix: 'prefix',
          suffix: 'suffix',
        });
        expect(await run<boolean>('hasItem', 'Three')).toBe(true);

        await run('reverse');
        expect(await run('items')).toEqual([
          `Three ${mode}`,
          `Two ${mode}`,
          `One ${mode}`,
        ]);

        await run('onlyTwo');
        expect(await run('items')).toEqual([`Two ${mode}`]);

        await run('restore');
        expect(await run('items')).toEqual([
          `One ${mode}`,
          `Two ${mode}`,
          `Three ${mode}`,
        ]);
        expect(await run('siblings')).toEqual({
          prefix: 'prefix',
          suffix: 'suffix',
        });
      });
    }
  });

  test('should keep dynamic Menubar identities stable across reorder and removal', async ({
    render,
    run,
  }) => {
    await render('menubarIdentity');

    const initialControls = await run<Controls>('controls');
    expect(initialControls.alpha).not.toBe(initialControls.beta);
    expect(initialControls.alpha).toBeTruthy();
    expect(initialControls.beta).toBeTruthy();
    const alphaControls = initialControls.alpha!;
    const betaControls = initialControls.beta!;

    await run('clickBeta');

    expect(await run<string>('bodyText')).not.toContain('Alpha action');
    expect(await run<number>('menuContentCount', betaControls)).toBe(1);

    await run('reorder');

    expect(await run<string>('bodyText')).not.toContain('Alpha action');
    expect(await run<Controls>('controls')).toEqual({
      alpha: alphaControls,
      beta: betaControls,
    });

    await run('removeBeta');

    expect((await run<Controls>('controls')).alpha).toBe(alphaControls);
    const afterRemoval = await run<string>('bodyText');
    expect(afterRemoval).not.toContain('Alpha action');
    expect(afterRemoval).not.toContain('Beta action');
    expect(await run<number>('menuContentCount', betaControls)).toBe(0);

    await run('restore');

    expect(await run<Controls>('controls')).toEqual({
      alpha: alphaControls,
      beta: betaControls,
    });
  });

  test('should reject duplicate dynamic Menubar values', async ({
    render,
    run,
  }) => {
    await render('duplicateMenubarValues');

    expect(await run<string | null>('error')).toMatch(
      /MenubarMenu values must be unique/
    );
  });

  test('should support mapped and For-rendered Slider parts', async ({
    render,
    root,
  }) => {
    await render('sliderParts');

    for (const mode of MODES) {
      await expect(
        root.locator(`[aria-label="${mode} value"]`)
      ).toHaveAttribute('aria-valuenow', '25');
    }
  });
});
