import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const plugins = [
    resolve({
        browser: false,
    }),
    typescript({
        tsconfig: './tsconfig.client.json',
        sourceMap: false,
    }),
    terser(),
];

const output = {
    dir: './public/',
    format: 'iife',
    sourcemap: false,
}

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: './src/app/widget.tsx',
        output,
        plugins,
    },
    {
        input: './src/app/lib.ts',
        output,
        plugins,
    },
];
