import { expect, test } from '../../fixtures';

for (const kind of ['list', 'table'] as const) {
  test(`should publish a Virtual ${kind} object API immediately and initialize its first frame at zero`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind });
    expect(await run('initial')).toEqual({
      apiAvailable: true,
      apiScrollTop: 0,
    });
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
    expect(await run('firstFrame')).toEqual({
      physical: 0,
      logical: 0,
      visibleStart: 0,
      viewportHeight: 112,
    });
  });

  test(`should restore Virtual ${kind} offset before caller DOM and API callbacks`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', {
      kind,
      callbacks: true,
      changeChildOffset: true,
    });
    expect(await run('callbackOffsets')).toEqual([0, 0]);
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
  });

  test(`should retain a newer Virtual ${kind} API reveal before queued initialization`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind, revealBeforeSetup: true });
    expect(await run('position')).toMatchObject({
      physical: 168,
      logical: 168,
    });
    expect(await run('firstFrame')).toEqual({
      physical: 168,
      logical: 168,
      visibleStart: 6,
      viewportHeight: 112,
    });
  });

  test(`should keep synchronous Virtual ${kind} restoration for an API callback without a DOM ref`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', {
      kind,
      apiCallbackOnly: true,
      changeChildOffset: true,
    });
    expect(await run('callbackOffsets')).toEqual([0]);
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
  });

  test(`should restore Virtual ${kind} offset before an accessor-backed object API ref`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', {
      kind,
      apiAccessorOnly: true,
      changeChildOffset: true,
    });
    expect(await run('callbackOffsets')).toEqual([0]);
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
  });

  test(`should let an untracked Virtual ${kind} return to zero cancel a pending reveal`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind });
    expect(await run('revealThenReturnToZero')).toEqual({
      physical: 0,
      logical: 0,
    });
  });

  test(`should keep user scrolling after Virtual ${kind} initialization`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind });
    await run('userScroll', 84);
    await expect
      .poll(() => run('position'))
      .toMatchObject({ physical: 84, logical: 84 });
  });

  test(`should preserve the released Virtual ${kind} before-initialization native offset behavior`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind, nativeScrollBeforeSetup: true });
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
    expect(await run('firstFrame')).toEqual({
      physical: 0,
      logical: 0,
      visibleStart: 0,
      viewportHeight: 112,
    });
  });

  test(`should restore Virtual ${kind} child offset changes by the first frame without caller callbacks`, async ({
    render,
    run,
  }) => {
    await render('initialOffset', { kind, changeChildOffset: true });
    expect(await run('position')).toMatchObject({ physical: 0, logical: 0 });
    expect(await run('firstFrame')).toEqual({
      physical: 0,
      logical: 0,
      visibleStart: 0,
      viewportHeight: 112,
    });
  });
}
