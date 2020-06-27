import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import inlineSvg from 'rollup-plugin-inline-svg';
import styles from 'rollup-plugin-styles';

const plugins = [
    resolve({
        browser: false,
    }),
    styles({
        mode: 'extract',
        modules: true,
        dts: true,
    }),
    typescript({
        tsconfig: './tsconfig.client.json',
        sourceMap: false,
    }),
    inlineSvg({
        removeTags: true,
        removingTags: ['title', 'desc', 'defs', 'style', 'metadata'],
        removeSVGTagAttrs: true,
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
