const { build } = require('vite');
const path = require('path');
const tsconfigPaths = require('vite-tsconfig-paths').default;

async function compileLib() {
    try {
        await build({
            resolve: {
                extensions: ['.ts', '.js'],
                alias: {
                    thrift: path.resolve('node_modules/@vality/woody/dist/thrift'),
                },
            },
            build: {
                lib: {
                    entry: path.resolve('clients/index.ts'),
                    name: 'thrift-codegen.bundle',
                    formats: ['es'],
                },
                outDir: 'dist',
                sourcemap: true,
            },
            plugins: [
                tsconfigPaths({
                    root: __dirname,
                }),
            ],
        });
        console.log('Library built successfully.');
    } catch (err) {
        console.error('Failed to build library:', err);
    }
}

module.exports = compileLib;
