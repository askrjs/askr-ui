import { jsx, jsxs, Fragment } from './index';
export { jsx, jsxs, Fragment };

// Provide a basic jsxDEV alias used by some toolchains
export function jsxDEV(type: any, props: any, key?: any) {
  return jsxs(type, props, key);
}
