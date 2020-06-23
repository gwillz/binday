import typescript from '@rollup/plugin-typescript';

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
    ],
}
