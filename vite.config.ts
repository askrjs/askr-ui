import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';
import packageJson from './package.json' with { type: 'json' };

const srcRoot = fileURLToPath(new URL('./src', import.meta.url));

function createPackageEntries() {
  return Object.fromEntries(
    Object.keys(packageJson.exports)
      .filter((subpath) => subpath !== './package.json')
      .map((subpath) => {
        if (subpath === '.') {
          return ['index', resolve(srcRoot, 'index.ts')];
        }

        const componentName = subpath.slice(2);
        return [
          `components/${componentName}/index`,
          resolve(srcRoot, 'components', componentName, 'index.ts'),
        ];
      })
  );
}

const packageEntries = createPackageEntries();

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
    preserveSymlinks: true,
  },
  pack: {
    entry: packageEntries,
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
      entry: packageEntries,
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
