import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';
import type { ESBuildOptions } from 'vite';

const currentDir = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(currentDir, 'src');
const jsxEsbuildOptions = {
  jsx: 'automatic',
  jsxImportSource: '@askrjs/askr',
} as ESBuildOptions;

export default defineConfig({
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    tabWidth: 2,
  },
  esbuild: jsxEsbuildOptions,
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(srcRoot, 'index.ts'),
        'components/composites/field/field': resolve(
          srcRoot,
          'components/composites/field/field.tsx'
        ),
      },
    },
    rollupOptions: {
      external: (id) => /^@askrjs\/askr(?:\/.*)?$/.test(id),
      output: [
        {
          dir: 'dist',
          entryFileNames: '[name].js',
          exports: 'named',
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        {
          dir: 'dist',
          entryFileNames: '[name].cjs',
          exports: 'named',
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      ],
    },
  },
});
