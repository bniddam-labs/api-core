import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dto/index': 'src/dto/index.ts',
    'validation/index': 'src/validation/index.ts',
    'swagger/index': 'src/swagger/index.ts',
    'http/index': 'src/http/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    '@nestjs/common',
    '@nestjs/swagger',
    '@saas/core',
    '@saas/utils',
    'reflect-metadata',
    'zod',
    'zod-validation-error',
  ],
});
