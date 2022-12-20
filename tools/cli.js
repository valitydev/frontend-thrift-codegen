const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const rimraf = require('rimraf');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const compileProto = require('./compile-proto');
const generateServiceTemplate = require('./generate-service-template');
const prepareGenerateServiceConfig = require('./prepare-generate-service-config');
const build = require('./build');

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
    Promise.all([
        fse.copy(
            path.resolve('clients/internal/metadata.json'),
            path.resolve('dist/metadata.json')
        ),
        fse.copy(
            path.resolve(__dirname, 'types/metadata.json.d.ts'),
            path.resolve('dist/types/metadata.json.d.ts')
        ),
    ]);

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
    await clean();
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    await compileProto(argv.inputs, outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath, argv.namespaces);
    await generateServiceTemplate(serviceTemplateConfig, argv.namespaces, outputPath);
    await copyTsUtils();
    await build();
    await copyMetadata();
    await copyTypes();
}

module.exports = codegenClient;
module.exports.default = codegenClient;
