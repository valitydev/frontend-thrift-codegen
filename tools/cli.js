const fse = require('fs-extra');
const path = require('path');
const shelljs = require('shelljs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { build } = require('tsup');

const compileProto = require('./compile-proto');
const generateServiceTemplate = require('./generate-service-template');
const prepareGenerateServiceConfig = require('./prepare-generate-service-config');

const clean = () => shelljs.rm('-rf', path.resolve('clients'), path.resolve('dist'));

const copyMetadataAsTsFile = async (outputProtoPath, metadataName) => {
    const metadataJsonPath = path.resolve(path.join(outputProtoPath, `${metadataName}.json`));
    const metadataTsPath = path.resolve(path.join(outputProtoPath, `${metadataName}.ts`));
    const content = await fse.readFile(metadataJsonPath, 'utf-8');
    await fse.outputFile(
        metadataTsPath,
        `import { ThriftAstMetadata } from '../utils/types';\n\n` +
            `export const metadata: ThriftAstMetadata[] = ${content};\n`,
    );
};

const copyStaticFiles = async () => fse.copy(path.resolve(__dirname, 'static'), 'clients');

async function codegenClient() {
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    const metadataName = 'metadata';

    const argv = yargs(hideBin(process.argv)).options({
        inputs: {
            alias: 'i',
            demandOption: true,
            type: 'array',
            description: 'List of thrift file folders for compilation.',
        },
        namespaces: {
            alias: 'n',
            demandOption: true,
            type: 'array',
            description: 'List of service namespaces which will be included.',
        },
    }).argv;
    clean();
    await compileProto(argv.inputs, outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath, argv.namespaces);
    const metadata = JSON.parse(
        await fse.readFile(path.resolve(outputProtoPath, 'metadata.json'), 'utf-8'),
    );

    await generateServiceTemplate(serviceTemplateConfig, argv.namespaces, outputPath, metadata);
    await copyStaticFiles();
    await copyMetadataAsTsFile(outputProtoPath, metadataName);

    await build({
        entry: [
            path.resolve(path.join(outputPath, 'index.ts')),
            ...argv.namespaces.map((ns) => path.resolve(path.join(outputPath, `${ns}.ts`))),
        ],
        sourcemap: true,
        dts: true,
        format: ['esm', 'cjs'],
        platform: 'browser',
        tsconfig: path.resolve(__dirname, '../tsconfig.json'),
        esbuildOptions(options) {
            options.alias = {
                thrift: path.resolve(__dirname, 'thrift/gen.js'),
            };
        },
    });
}

module.exports = codegenClient;
module.exports.default = codegenClient;
