import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'core/index': 'src/core/index.ts',
		'nestjs/index': 'src/nestjs/index.ts',
	},
	format: ['cjs', 'esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	splitting: false,
	treeshake: true,
	external: [
		'@nestjs/common',
		'@nestjs/core',
		'@nestjs/swagger',
		'reflect-metadata',
		'rxjs',
		'zod',
		'zod-validation-error',
	],
});
