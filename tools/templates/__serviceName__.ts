import { CodegenClient } from '../proto-compiled/__namespace__-__serviceName__';

import { getMethodsMetadata, codegenClientReducer, connect, ConnectOptions } from '../utils';

const importMetadata = async () => {
    const metadata: any = await import('../proto-compiled/metadata.json');
    return metadata.default;
};

const importService = async () =>
    await import('../proto-compiled/__namespace__/gen-nodejs/__serviceName__');

const importContext = async () => {
    const context = await import('../proto-compiled/__namespace__/context');
    return context.default;
};

const __serviceName__ = async (options: ConnectOptions): Promise<CodegenClient> => {
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const service = await importService();
    const meta = await importMetadata();
    const connection = await connect(options, service);
    const context = await importContext();
    const methodsMeta = getMethodsMetadata(meta, namespace, serviceName);
    return methodsMeta.reduce(
        codegenClientReducer<CodegenClient>(connection, meta, namespace, context),
        {} as CodegenClient
    );
};

export default __serviceName__;
