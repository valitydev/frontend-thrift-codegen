const { generateTemplateFilesBatch } = require('generate-template-files');

const generateServiceTemplate = async (config) => {
    await generateTemplateFilesBatch([
        ...config.map(({ serviceName, namespace }) => ({
            option: 'Create thrift client',
            defaultCase: '(noCase)',
            entry: {
                folderPath: './tools/templates/__serviceName__.ts',
            },
            dynamicReplacers: [
                { slot: '__serviceName__', slotValue: serviceName },
                { slot: '__namespace__', slotValue: namespace },
            ],
            output: {
                path: './generated-clients/__serviceName__.ts',
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        })),
        {
            option: 'Create index',
            defaultCase: '(noCase)',
            entry: {
                folderPath: './tools/templates/index.ts',
            },
            dynamicReplacers: [{ slot: '__serviceName__', slotValue: 'TEST' }],
            output: {
                path: './generated-clients/index.ts',
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        },
    ]);
};

module.exports = generateServiceTemplate;
