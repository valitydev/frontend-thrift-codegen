const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');

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

const copyTypes = async () =>
    new Promise((resolve, reject) => {
        glob(path.resolve('clients/**/*.d.ts'), (err, files) => {
            if (err) reject(err);
            for (const file of files) {
                const parsed = path.parse(file);
                const output = parsed.dir.replace(path.resolve('clients'), '');
                fse.copySync(file, path.resolve(`dist/types/${output}/${parsed.base}`));
                resolve();
            }
        });
    });

const copyMetadata = async () =>
    fse.copy(path.resolve('clients/internal/metadata.json'), path.resolve('dist/metadata.json'));

const build = async () =>
    new Promise((resolve, reject) => {
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
            },
            (err, stats) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                console.log(
                    stats.toString({
                        chunks: false, // Makes the build much quieter
                        colors: true, // Shows colors in the console
                    })
                );
                resolve();
            }
        );
    });

async function codegenClient() {
    await clean();
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    await compileProto(outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath);
    await generateServiceTemplate(serviceTemplateConfig, outputPath);
    await fse.copy(path.resolve(__dirname, 'utils'), path.resolve('clients/utils'));
    await build();
    await copyMetadata();
    await copyTypes();
}

module.exports = codegenClient;
module.exports.default = codegenClient;
