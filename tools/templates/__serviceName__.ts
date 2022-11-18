import { CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';
import * as metadata from './internal/metadata.json';

import { getMethodsMetadata, codegenClientReducer, connect, ConnectOptions } from '__utilsPath__';

const __serviceName__ = async (options: ConnectOptions): Promise<CodegenClient> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const meta = (metadata as any).default;
    const connection = await connect(options, service);
    const methodsMeta = getMethodsMetadata(meta, namespace, serviceName);
    return methodsMeta.reduce(
        codegenClientReducer<CodegenClient>(connection, meta, namespace, context),
        {} as CodegenClient
    );
};

export default __serviceName__;
