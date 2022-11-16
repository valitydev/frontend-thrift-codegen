const path = require('path');

const { generateTemplateFilesBatch } = require('generate-template-files');

const generateServiceTemplate = async (config, outputPath) => {
    await generateTemplateFilesBatch([
        ...config.map(({ serviceName, namespace }) => ({
            option: 'Create thrift client',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/__serviceName__.ts'),
            },
            dynamicReplacers: [
                { slot: '__serviceName__', slotValue: serviceName },
                { slot: '__namespace__', slotValue: namespace },
                { slot: '__utilsPath__', slotValue: path.resolve(__dirname, 'utils') },
            ],
            output: {
                path: `${outputPath}/__serviceName__.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        })),
        {
            option: 'Create index',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/index.ts'),
            },
            dynamicReplacers: [{ slot: '__serviceName__', slotValue: 'TEST' }],
            output: {
                path: `${outputPath}/index.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        },
    ]);
};

module.exports = generateServiceTemplate;
