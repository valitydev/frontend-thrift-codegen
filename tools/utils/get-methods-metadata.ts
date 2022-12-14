import { Method, Service } from '@vality/thrift-ts';
import { ThriftAstMetadata } from './types';

const getServiceMetadata = (
    metadata: ThriftAstMetadata[],
    namespace: string,
    serviceName: string
): Service => {
    const namespaceMeta = metadata.find((m) => m.name === namespace);
    const servicesMeta = namespaceMeta?.ast?.service;
    if (!servicesMeta) {
        throw new Error(`Service metadata is not found with namespace ${namespace}`);
    }
    const serviceMeta = servicesMeta[serviceName];
    if (!serviceMeta) {
        throw new Error(`Service metadata is not found with serviceName ${serviceName}`);
    }
    return serviceMeta;
};

const toMethodsMetadata = (serviceMetadata: Service): Method[] =>
    Object.entries(serviceMetadata.functions).map(([_, method]) => method);

export const getMethodsMetadata = (
    metadata: ThriftAstMetadata[],
    namespace: string,
    serviceName: string
): Method[] => {
    const serviceMeta = getServiceMetadata(metadata, namespace, serviceName);
    return toMethodsMetadata(serviceMeta);
};
