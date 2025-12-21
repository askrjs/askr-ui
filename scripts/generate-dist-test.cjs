const fs = require('fs');
const path = require('path');

const content = `// Generated placeholder for tsd: test harness alongside dist types
`;

const out = path.resolve(__dirname, '..', 'dist', 'index.test-d.ts');
fs.writeFileSync(out, content, 'utf8');
console.log('Wrote', out);
