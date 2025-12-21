import fs from 'fs';
import path from 'path';

const content = `// Generated placeholder for tsd: test harness alongside dist types
`;

const out = path.resolve(process.cwd(), 'dist', 'index.test-d.ts');
fs.writeFileSync(out, content, 'utf8');
console.log('Wrote', out);
