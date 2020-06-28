import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import inlineSvg from 'rollup-plugin-inline-svg';
import styles from 'rollup-plugin-styles';

const plugins = [
    styles({
        mode: 'extract',
        modules: true,
        dts: true,
    }),
    resolve({
        browser: false,
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

const watch = {
    clearScreen: false,
};

/** @type {import('rollup').RollupOptions} */
export default [
    {
        input: './src/app/widget.tsx',
        watch,
        output,
        plugins,
    },
    {
        input: './src/app/lib.ts',
        watch,
        output,
        plugins,
    },
    {
        input: './src/server/index.ts',
        output: {
            dir: './dist/',
            format: 'commonjs',
            sourcemap: true,
        },
        watch,
        // Yes, I should use resolve/commonjs/builtin-modules but I can't
        // quite figure them out yet.
        external: [
            'path', 'util', 'fs',
            'express', 'morgan', 'compression', 'cors',
            'markdown-it', 'date-fns', /@bikeshaving/, /@turf/,
        ],
        plugins: [
            styles({
                mode: 'extract',
                modules: true,
                dts: true,
            }),
            typescript({
                tsconfig: './tsconfig.server.json',
            }),
            inlineSvg({
                removeTags: true,
                removingTags: ['title', 'desc', 'defs', 'style', 'metadata'],
                removeSVGTagAttrs: true,
            }),
        ],
    },
];
