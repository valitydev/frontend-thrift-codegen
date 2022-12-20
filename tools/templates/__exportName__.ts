import { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';

import { getMethodsMetadata, codegenClientReducer } from '__utilsPath__';
import { ConnectOptions } from '__utilsPath__/types';

export { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';

export const __exportName__ = async (
    options: ConnectOptions
): Promise<__exportName__CodegenClient> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const methodsMeta = getMethodsMetadata(options.metadata, namespace, serviceName);
    const connectionContext = {
        path: options.path,
        service,
        headers: options.headers,
        deadlineConfig: options.deadlineConfig,
    };
    const loggingContext = { namespace, serviceName, logging: options.logging || false };
    return methodsMeta.reduce(
        codegenClientReducer<__exportName__CodegenClient>(
            connectionContext,
            options.metadata,
            loggingContext,
            context
        ),
        {} as __exportName__CodegenClient
    );
};
