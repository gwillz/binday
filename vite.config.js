
/** @type {import('vite').UserConfig} */
export default {
    base: '',
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'index.js',
                assetFileNames: '[name].[ext]',
                manualChunks: (id) => {
                    if (id.endsWith('demo.css')) {
                        return 'demo';
                    }
                    return 'index';
                },
            },
        }
    }
}
