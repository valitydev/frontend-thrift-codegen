import { CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';

import { getMethodsMetadata, codegenClientReducer, connect } from '__utilsPath__';
import { ConnectOptions } from '__utilsPath__/types';

export type __exportName__Client = CodegenClient;

export const __exportName__ = async (options: ConnectOptions): Promise<__exportName__Client> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const path = options.path || '__connectionPath__';
    const connection = await connect(path, service, options.headers, options.deadlineConfig);
    const methodsMeta = getMethodsMetadata(options.metadata, namespace, serviceName);
    return methodsMeta.reduce(
        codegenClientReducer<CodegenClient>(connection, options.metadata, namespace, context),
        {} as CodegenClient
    );
};
