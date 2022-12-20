const fs = require('fs');
const path = require('path');
const camelCase = require('lodash/camelCase');

const duplicatedNamespaceServiceNameReducer = (config, configCurrEl) => {
    const result = {
        ...configCurrEl,
        exportName:
            configCurrEl.namespace === configCurrEl.serviceName.toLowerCase()
                ? `${configCurrEl.serviceName}Service`
                : configCurrEl.serviceName,
    };
    return [...config, result];
};

const duplicatedServiceNamesReducer = (config, configCurrEl) => {
    const duplicate = config.find(({ serviceName }) => serviceName === configCurrEl.serviceName);
    const result = {
        ...configCurrEl,
        exportName: duplicate
            ? camelCase(`${camelCase(configCurrEl.namespace)}${configCurrEl.serviceName}`)
            : configCurrEl.serviceName,
    };
    return [...config, result];
};

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
                exportName: serviceName,
            };
        })
        .reduce(duplicatedServiceNamesReducer, [])
        .reduce(duplicatedNamespaceServiceNameReducer, [])
        .reduce(namespacesReducer(includedNamespaces), []);

module.exports = prepareGenerateServiceConfig;
