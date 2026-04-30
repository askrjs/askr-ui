import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  fmt: {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    tabWidth: 2,
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@askrjs/askr',
  },
  resolve: {
    alias: {},
    preserveSymlinks: true,
  },
  pack: {
    entry: {
      index: resolve(srcRoot, 'index.ts'),
      'components/composites/field/field': resolve(
        srcRoot,
        'components/composites/field/field.tsx'
      ),
    },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    platform: 'neutral',
    tsconfig: 'tsconfig.pack.json',
    dts: true,
    sourcemap: true,
    unbundle: true,
    treeshake: false,
    deps: {
      neverBundle: [/^@askrjs\/askr(?:\/.*)?$/],
    },
  },
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
