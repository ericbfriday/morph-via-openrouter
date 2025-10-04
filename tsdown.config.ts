import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: true,
    dts: true,
    sourcemap: true,
    platform: 'node',
    splitting: false,
    minify: false,
  },
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['esm'],
    target: 'node18',
    outDir: 'dist',
    clean: false,
    dts: false,
    sourcemap: true,
    platform: 'node',
    splitting: false,
    minify: false,
    banner: {
      cli: '#!/usr/bin/env node',
    },
  },
]);
