import { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';

import { getMethodsMetadata, codegenClientReducer, connect } from '__utilsPath__';
import { ConnectOptions } from '__utilsPath__/types';

export { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';

export const __exportName__ = async (
    options: ConnectOptions
): Promise<__exportName__CodegenClient> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const path = options.path || '__connectionPath__';
    const connection = await connect(path, service, options.headers, options.deadlineConfig);
    const methodsMeta = getMethodsMetadata(options.metadata, namespace, serviceName);
    return methodsMeta.reduce(
        codegenClientReducer<__exportName__CodegenClient>(
            connection,
            options.metadata,
            { namespace, serviceName, logging: options.logging || false },
            context
        ),
        {} as __exportName__CodegenClient
    );
};
