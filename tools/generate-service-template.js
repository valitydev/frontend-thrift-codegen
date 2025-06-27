const path = require('path');

const { generateTemplateFilesBatch } = require('generate-template-files');

const generateServiceTemplate = async (config, typeExportNamespaces, outputPath, metadata) => {
    await generateTemplateFilesBatch([
        ...config.map(({ serviceName, namespace, exportName }) => {
            const methods = Object.values(
                metadata.find((m) => m.name === namespace).ast.service[serviceName].functions || {},
            );

            return {
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
                    {
                        slot: '__methods__',
                        slotValue: Object.values(methods)
                            .map(
                                (fun) =>
                                    `/**\n` +
                                    [
                                        fun.name,
                                        ...[
                                            ...fun.throws.map(
                                                (t) =>
                                                    `{ThriftServiceError} ${
                                                        typeof t.type === 'object'
                                                            ? JSON.stringify(t.type)
                                                            : String(t.type)
                                                    }`,
                                            ),
                                            '{ThriftServiceTimeoutError}',
                                            '{ThriftServiceNotFoundError}',
                                        ].map((d) => `@throws ${d}`),
                                    ]
                                        .map((v) => `* ${v}`)
                                        .join('\n') +
                                    '\n*/\n' +
                                    `${fun.name}(...params: Parameters<${exportName}CodegenClient['${fun.name}']>) {` +
                                    ` return this.client$.pipe(switchMap((c) => c.${fun.name}(...params))); ` +
                                    `}`,
                            )
                            .join('\n\n'),
                    },
                ],
                output: {
                    path: `${outputPath}/__exportName__.ts`,
                    pathAndFileNameDefaultCase: '(noCase)',
                    overwrite: true,
                },
            };
        }),
        ...typeExportNamespaces.map((typesNamespace) => ({
            option: 'Create types namespace',
            defaultCase: '(noCase)',
            entry: {
                folderPath: path.resolve(__dirname, 'templates/__typesNamespace__.ts'),
            },
            dynamicReplacers: [
                { slot: '__typesNamespace__', slotValue: typesNamespace },
                {
                    slot: '__exports__',
                    slotValue: config
                        .filter((c) => c.namespace === typesNamespace)
                        .map((v) => `export {${v.serviceName}} from './${v.exportName}';`)
                        .join('\n'),
                },
            ],
            output: {
                path: `${outputPath}/__typesNamespace__.ts`,
                pathAndFileNameDefaultCase: '(noCase)',
                overwrite: true,
            },
        })),
    ]);
};

module.exports = generateServiceTemplate;
