const fs = require('fs');
const path = require('path');

const namespacesReducer = (includedNamespaces) => (config, configCurrEl) =>
    includedNamespaces.includes(configCurrEl.namespace) ? [...config, configCurrEl] : [...config];

/**
 * Dist with compiled proto contains files with name: '{namespace}-{serviceName}.ext'
 * Namespace, serviceName, exportName require for preparing codegen client.
 */
const prepareGenerateServiceConfig = (compiledDist, includedNamespaces) =>
    fs
        .readdirSync(compiledDist)
        .map((filePath) => path.parse(filePath))
        .filter(({ ext, name }) => ext === '.js' && name.includes('-'))
        .map(({ name }) => {
            const [namespace, serviceName] = name.split('-');
            return {
                namespace,
                serviceName,
                exportName: `${namespace}_${serviceName}`,
            };
        })
        .reduce(namespacesReducer(includedNamespaces), []);
module.exports = prepareGenerateServiceConfig;
