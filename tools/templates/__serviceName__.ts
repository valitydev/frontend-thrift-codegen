import { CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';

import { getMethodsMetadata, codegenClientReducer, connect, ConnectOptions } from '__utilsPath__';

export const __serviceName__ = async (options: ConnectOptions): Promise<CodegenClient> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const connection = await connect(options, service);
    const methodsMeta = getMethodsMetadata(options.metadata, namespace, serviceName);
    return methodsMeta.reduce(
        codegenClientReducer<CodegenClient>(connection, options.metadata, namespace, context),
        {} as CodegenClient
    );
};
