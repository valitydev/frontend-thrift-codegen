const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');
const CopyPlugin = require('copy-webpack-plugin');

const compileProto = require('./compile-proto');
const generateServiceTemplate = require('./generate-service-template');

/**
 * Dist with compiled proto contains files with name: '{namespace}-{serviceName}.ext'
 * Pair of namespace and serviceName requires for preparing codegen client.
 */
const prepareGenerateServiceConfig = (compiledDist) =>
    fs
        .readdirSync(compiledDist)
        .map((filePath) => path.parse(filePath))
        .filter(({ ext, name }) => ext === '.js' && name.includes('-'))
        .map(({ name }) => {
            const [namespace, serviceName] = name.split('-');
            return { namespace, serviceName };
        });

const rm = (path) =>
    new Promise((resolve, reject) => rimraf(path, (err) => (err ? reject(err) : resolve())));

const clean = async () => {
    await rm(path.resolve('clients'));
    await rm(path.resolve('dist'));
};

async function codegenClient() {
    await clean();
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    await compileProto(outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath);
    await generateServiceTemplate(serviceTemplateConfig, outputPath);
    webpack(
        {
            name: 'thrift-codegen',
            mode: 'production',
            entry: path.resolve('clients/Repository.ts'),
            devtool: false,
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
                filename: '[name].bundle.js',
                path: path.resolve('dist'),
                globalObject: 'this',
                library: {
                    name: 'thriftCodegen',
                    type: 'umd',
                },
            },
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: path.resolve('clients/internal/metadata.json'),
                            to: path.resolve('dist'),
                        },
                    ],
                }),
            ],
        },
        (err, stats) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(
                stats.toString({
                    chunks: false, // Makes the build much quieter
                    colors: true, // Shows colors in the console
                })
            );
        }
    );
}

module.exports = codegenClient;
module.exports.default = codegenClient;
