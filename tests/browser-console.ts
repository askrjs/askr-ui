type ConsoleMethod = 'warn' | 'error' | 'log' | 'info' | 'debug';
type ConsoleMatcher = RegExp | string;

export interface AllowedConsoleMessages {
  warn?: ConsoleMatcher[];
  error?: ConsoleMatcher[];
  log?: ConsoleMatcher[];
  info?: ConsoleMatcher[];
  debug?: ConsoleMatcher[];
}

interface ConsoleEntry {
  method: ConsoleMethod;
  message: string;
}

interface ConsoleCaptureState {
  entries: ConsoleEntry[];
  allowances: Record<ConsoleMethod, ConsoleMatcher[]>;
  originals: Partial<Record<ConsoleMethod, (...args: unknown[]) => void>>;
  active: boolean;
}

const CONSOLE_METHODS: ConsoleMethod[] = [
  'warn',
  'error',
  'log',
  'info',
  'debug',
];

const GLOBAL_STATE_KEY = '__ASKR_UI_BROWSER_CONSOLE_CAPTURE__';

type GlobalWithConsoleState = typeof globalThis & {
  [GLOBAL_STATE_KEY]?: ConsoleCaptureState;
};

function createAllowances(): Record<ConsoleMethod, ConsoleMatcher[]> {
  return {
    warn: [],
    error: [],
    log: [],
    info: [],
    debug: [],
  };
}

function getState(): ConsoleCaptureState {
  const globalWithState = globalThis as GlobalWithConsoleState;
  const existing = globalWithState[GLOBAL_STATE_KEY];

  if (existing) {
    return existing;
  }

  const created: ConsoleCaptureState = {
    entries: [],
    allowances: createAllowances(),
    originals: {},
    active: false,
  };

  globalWithState[GLOBAL_STATE_KEY] = created;
  return created;
}

function formatConsoleArgs(args: unknown[]): string {
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

function matchesAny(message: string, patterns: ConsoleMatcher[]): boolean {
  return patterns.some((pattern) =>
    typeof pattern === 'string'
      ? message.includes(pattern)
      : pattern.test(message)
  );
}

export function allowConsole(allowances: AllowedConsoleMessages): void {
  const state = getState();

  for (const method of CONSOLE_METHODS) {
    const patterns = allowances[method];
    if (patterns && patterns.length > 0) {
      state.allowances[method].push(...patterns);
    }
  }
}

export function beginConsoleCapture(): void {
  const state = getState();

  state.entries = [];
  state.allowances = createAllowances();

  if (state.active) {
    return;
  }

  for (const method of CONSOLE_METHODS) {
    const original = console[method].bind(console) as (
      ...args: unknown[]
    ) => void;
    state.originals[method] = original;

    console[method] = ((...args: unknown[]) => {
      state.entries.push({
        method,
        message: formatConsoleArgs(args),
      });
    }) as (typeof console)[typeof method];
  }

  state.active = true;
}

export function endConsoleCapture(): void {
  const state = getState();
  const entries = [...state.entries];
  const allowances = state.allowances;

  try {
    const unexpectedEntries = entries.filter(
      (entry) => !matchesAny(entry.message, allowances[entry.method])
    );

    if (unexpectedEntries.length > 0) {
      throw new Error(
        unexpectedEntries
          .map((entry) => `${entry.method}: ${entry.message}`)
          .join('\n')
      );
    }
  } finally {
    for (const method of CONSOLE_METHODS) {
      const original = state.originals[method];
      if (original) {
        console[method] = original as (typeof console)[typeof method];
      }
    }

    state.entries = [];
    state.allowances = createAllowances();
    state.originals = {};
    state.active = false;
  }
}
