const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

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

async function codegenClient() {
    const compiledDist = './proto-compiled';
    await compileProto(compiledDist);
    const serviceTemplateConfig = prepareGenerateServiceConfig(compiledDist);
    await generateServiceTemplate(serviceTemplateConfig);
    // webpack(
    //     {
    //         name: 'thrift-client',
    //         mode: 'production',
    //         entry: './generated-clients/index.ts',
    //         devtool: false,
    //         module: {
    //             rules: [
    //                 {
    //                     test: /\.ts?$/,
    //                     use: 'ts-loader',
    //                     exclude: /node_modules/,
    //                 },
    //             ],
    //         },
    //         resolve: {
    //             extensions: ['.ts', '.js'],
    //             alias: {
    //                 thrift: path.resolve('node_modules/@vality/woody/dist/thrift'),
    //             },
    //         },
    //         output: {
    //             filename: 'index.js',
    //             path: path.resolve('lib'),
    //             library: {
    //                 name: 'thriftCodegen',
    //                 type: 'umd',
    //             },
    //         },
    //     },
    //     (err, stats) => {
    //         if (err) {
    //             console.error(err);
    //             return;
    //         }

    //         console.log(
    //             stats.toString({
    //                 chunks: false, // Makes the build much quieter
    //                 colors: true, // Shows colors in the console
    //             })
    //         );
    //     }
    // );
}

module.exports = codegenClient;
module.exports.default = codegenClient;
