import fs from 'node:fs';
import dotenv from 'dotenv';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import run from '@rollup/plugin-run';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  cache: false,
  external: ['ssh2'],
  output: [
    {
      file: './dist/esm/index.mjs',
      format: 'esm',
      inlineDynamicImports: true,
    },
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
  plugins: [
    typescript({
      sourceMap: true,
      inlineSourceMap: true,
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'Bundler',
        },
      },
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    process.env.NODE_ENV !== 'production' &&
      run({
        execArgv: ['-r', 'source-map-support/register'],
        args: ['--run-on-start', '--cron'],
        env: dotenv.parse(
          fs.readFileSync('.env.local', 'utf-8'),
        ),
      }),
  ].filter(Boolean),
};
