import { expectType, expectError } from 'tsd';
import type { Button as ButtonType } from '../../dist/index.d.ts';
// Use the runtime export to exercise call signature, but import types directly for static checks
import { Button } from '../../dist';

// Default render returns an HTMLButtonElement
const b = Button({ children: 'x' });
expectType<HTMLButtonElement>(b);

// asChild with an <a> returns the anchor element type
const a = document.createElement('a');
const b2 = Button({ asChild: true, children: a });
expectType<HTMLAnchorElement>(b2);

// Providing `type` should be allowed for native button
const b3 = Button({ children: 'x', type: 'submit' });
expectType<HTMLButtonElement>(b3);

// Passing `type` when `asChild: true` should be allowed by runtime but ideally not forwarded; ensure types prevent accidental usage
expectError(Button({ asChild: true, children: a, type: 'button' }));

// Passing unknown props that are not accepted by button should error
expectError(Button({ href: 'https://example.com' }));
