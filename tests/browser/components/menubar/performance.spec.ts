import { expect, test } from '../../fixtures';

test.describe('Menubar - Performance paths', () => {
  test('should skip the document-wide content query for non-Tab keys', async ({
    render,
    run,
  }) => {
    await render('nonTabKeyDoesNotQueryAllMenubars');

    expect(await run<number>('dispatchKey', 'F1')).toBe(0);
  });

  test('should retain the document-wide content query for Tab navigation', async ({
    render,
    run,
  }) => {
    await render('nonTabKeyDoesNotQueryAllMenubars');

    expect(await run<number>('dispatchKey', 'Tab')).toBe(1);
  });
});
