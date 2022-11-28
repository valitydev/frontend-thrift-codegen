const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const rimraf = require('rimraf');
const camelCase = require('lodash/camelCase');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const compileProto = require('./compile-proto');
const generateServiceTemplate = require('./generate-service-template');
const build = require('./build');

/**
 * Dist with compiled proto contains files with name: '{namespace}-{serviceName}.ext'
 * Pair of namespace and serviceName requires for preparing codegen client.
 */
const prepareGenerateServiceConfig = (compiledDist, includedNamespaces) => {
    const result = fs
        .readdirSync(compiledDist)
        .map((filePath) => path.parse(filePath))
        .filter(({ ext, name }) => ext === '.js' && name.includes('-'))
        .map(({ name }) => {
            const [namespace, serviceName] = name.split('-');
            return {
                namespace,
                serviceName,
            };
        })
        .reduce((acc, curr) => {
            const duplicate = acc.find(({ serviceName }) => serviceName === curr.serviceName);
            const result = {
                ...curr,
                exportName: duplicate
                    ? camelCase(`${camelCase(curr.namespace)}${curr.serviceName}`)
                    : curr.serviceName,
            };
            return [...acc, result];
        }, []);
    if (includedNamespaces.length === 0) {
        return result;
    }
    return result.reduce(
        (acc, curr) => (includedNamespaces.includes(curr.namespace) ? [...acc, curr] : [...acc]),
        []
    );
};

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
        types: {
            alias: 't',
            demandOption: true,
            type: 'array',
            description: 'List of types namespaces witch will be exported.',
        },
    }).argv;
    await clean();
    const outputPath = './clients';
    const outputProtoPath = `${outputPath}/internal`;
    await compileProto(argv.inputs, outputProtoPath);
    const serviceTemplateConfig = prepareGenerateServiceConfig(outputProtoPath, argv.namespaces);
    await generateServiceTemplate(serviceTemplateConfig, argv.types, outputPath);
    await copyTsUtils();
    await build();
    await copyMetadata();
    await copyTypes();
}

module.exports = codegenClient;
module.exports.default = codegenClient;
