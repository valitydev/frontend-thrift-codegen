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

const copyMetadataAsTsFile = async () => {
    const metadataJsonPath = path.resolve('clients/internal/metadata.json');
    const metadataTsPath = path.resolve('clients/internal/metadata.ts');
    const content = await fse.readFile(metadataJsonPath, 'utf-8');
    await fse.outputFile(metadataTsPath, `export const metadata: any[] = ${content}\n`);
};

const copyTsUtils = async () =>
    fse.copy(path.resolve(__dirname, 'utils'), path.resolve('clients/utils'));

async function codegenClient() {
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
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    await compileProto(argv.inputs, outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath, argv.namespaces);
    const metadata = JSON.parse(
        await fse.readFile(path.resolve(outputProtoPath, 'metadata.json'), 'utf-8'),
    );
    await generateServiceTemplate(serviceTemplateConfig, argv.namespaces, outputPath, metadata);
    await copyTsUtils();
    await copyMetadataAsTsFile();
    await build({
        entry: [path.resolve(path.join(outputPath, 'index.ts'))],
        sourcemap: true,
        dts: true,
        minify: true,
    });
}

module.exports = codegenClient;
module.exports.default = codegenClient;
