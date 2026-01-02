import { expectType, expectError } from 'tsd';
import type { Button as ButtonType } from '../../dist/index.d.ts';
// Use the runtime export to exercise call signature, but import types directly for static checks
import { Button } from '../../dist';

// Button returns a JSX element (VNode)
const b = Button({ children: 'x' });
expectType<JSX.Element>(b);

// asChild also returns a JSX element (VNode)
const child = (<a />) as any;
const b2 = Button({ asChild: true, children: child });
expectType<JSX.Element>(b2);

// Providing `type` should be allowed for native button
const b3 = Button({ children: 'x', type: 'submit' });
expectType<JSX.Element>(b3);

// Passing `type` when `asChild: true` should be allowed by runtime but ideally not forwarded; ensure types prevent accidental usage
expectError(Button({ asChild: true, children: child, type: 'button' }));
