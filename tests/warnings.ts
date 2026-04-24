import { vi } from 'vite-plus/test';

type LogMatcher = RegExp | string;

interface WarningOptions {
  allowWarnings?: LogMatcher[];
  allowErrors?: LogMatcher[];
}

function formatLog(args: unknown[]): string {
  return args
    .map((value) => {
      if (typeof value === 'string') {
        return value;
      }

      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(' ');
}

function matchesAny(message: string, patterns: LogMatcher[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string'
      ? message.includes(pattern)
      : pattern.test(message)
  );
}

export async function expectNoUnexpectedWarnings(
  callback: () => void | Promise<void>,
  options: WarningOptions = {}
) {
  const warnings: string[] = [];
  const errors: string[] = [];

  const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
    warnings.push(formatLog(args));
  });
  const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(formatLog(args));
  });

  try {
    await callback();
  } finally {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  }

  const unexpectedWarnings = warnings.filter(
    (message) => !matchesAny(message, options.allowWarnings ?? [])
  );
  const unexpectedErrors = errors.filter(
    (message) => !matchesAny(message, options.allowErrors ?? [])
  );

  if (unexpectedWarnings.length > 0 || unexpectedErrors.length > 0) {
    throw new Error(
      [
        ...unexpectedWarnings.map((message) => `warn: ${message}`),
        ...unexpectedErrors.map((message) => `error: ${message}`),
      ].join('\n')
    );
  }
}
