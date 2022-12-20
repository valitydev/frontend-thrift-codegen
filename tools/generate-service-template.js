const path = require('path');

const { generateTemplateFilesBatch } = require('generate-template-files');

const prepareIndexFileContent = (config, typeExportNamespaces) => {
    const serviceExports = config.reduce(
        (acc, { exportName }) => acc.concat(`export * from './${exportName}';\n`),
        ''
    );
    return typeExportNamespaces.reduce(
        (acc, typeNamespace) =>
            acc.concat(`export * as ${typeNamespace} from './${typeNamespace}';\n`),
        serviceExports
    );
};

const generateServiceTemplate = async (config, typeExportNamespaces, outputPath) => {
    await generateTemplateFilesBatch([
        ...config.map(({ serviceName, namespace, exportName }) => ({
            option: 'Create thrift client',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/__exportName__.ts'),
            },
            dynamicReplacers: [
                { slot: '__exportName__', slotValue: exportName },
                { slot: '__serviceName__', slotValue: serviceName },
                { slot: '__namespace__', slotValue: namespace },
                { slot: '__utilsPath__', slotValue: './utils' },
            ],
            output: {
                path: `${outputPath}/__exportName__.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        })),
        ...typeExportNamespaces.map((typesNamespace) => ({
            option: 'Create types namespace',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/__typesNamespace__.ts'),
            },
            dynamicReplacers: [{ slot: '__typesNamespace__', slotValue: typesNamespace }],
            output: {
                path: `${outputPath}/__typesNamespace__.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        })),
        {
            option: 'Create index file with exports',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/index.ts'),
            },
            dynamicReplacers: [
                {
                    slot: '__export__',
                    slotValue: prepareIndexFileContent(config, typeExportNamespaces),
                },
            ],
            output: {
                path: `${outputPath}/index.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        },
    ]);
};

module.exports = generateServiceTemplate;
