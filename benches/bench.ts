import { test, type BenchFn, type BenchFnOptions } from 'vite-plus/test';

export function registerBench(
  name: string,
  fn: BenchFn,
  options?: BenchFnOptions
): void {
  test(name, async ({ bench }) => {
    const registration =
      options === undefined ? bench(name, fn) : bench(name, options, fn);
    await registration.run();
  });
}
