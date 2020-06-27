import typescript from '@rollup/plugin-typescript';
import inlineSvg from 'rollup-plugin-inline-svg';

/** @type {import('rollup').RollupOptions} */
export default {
    input: './src/server/index.ts',
    output: {
        dir: './dist/',
        format: 'commonjs',
        sourcemap: true,
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.server.json',
        }),
        inlineSvg(),
        styles({
            mode: 'extract',
        }),
    ],
}
