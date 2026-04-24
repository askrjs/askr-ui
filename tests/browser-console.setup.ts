import { afterEach, beforeEach } from 'vite-plus/test';
import {
  allowConsole,
  beginConsoleCapture,
  endConsoleCapture,
} from './browser-console';

beforeEach(() => {
  beginConsoleCapture();
  allowConsole({
    warn: ['[askr] Slow render detected'],
  });
});

afterEach(() => {
  endConsoleCapture();
});
