import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

/** @type {import('rollup').RollupOptions} */
export default {
    input: './src/app/index.tsx',
    output: {
        file: './public/index.js',
        format: 'iife',
        sourcemap: false,
        globals: false,
    },
    // external: false,
    plugins: [
        resolve({
            browser: false,
        }),
        typescript({
            tsconfig: './tsconfig.client.json',
            sourceMap: false,
        }),
        terser(),
    ],
}
