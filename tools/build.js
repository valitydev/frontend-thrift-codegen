const path = require('path');
const webpack = require('webpack');

const build = () =>
    new Promise((resolve, reject) => {
        webpack(
            {
                name: 'thrift-codegen',
                mode: 'production',
                entry: path.resolve('clients/index.ts'),
                devtool: 'source-map',
                module: {
                    rules: [
                        {
                            test: /\.ts?$/,
                            use: [
                                {
                                    loader: 'ts-loader',
                                    options: {
                                        context: __dirname,
                                        configFile: path.resolve(__dirname, 'tsconfig.json'),
                                    },
                                },
                            ],
                            exclude: /node_modules/,
                        },
                    ],
                },
                resolve: {
                    extensions: ['.ts', '.js'],
                    alias: {
                        thrift: path.resolve('node_modules/@vality/woody/dist/thrift'),
                    },
                },
                output: {
                    filename: 'thrift-codegen.bundle.js',
                    path: path.resolve('dist'),
                    globalObject: 'this',
                    library: {
                        name: 'thriftCodegen',
                        type: 'umd',
                    },
                },
            },
            (err, stats) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                console.log(
                    stats.toString({
                        chunks: false,
                        colors: true,
                    }),
                );
                stats.hasErrors() ? reject('Build failed') : resolve();
            },
        );
    });

module.exports = build;
