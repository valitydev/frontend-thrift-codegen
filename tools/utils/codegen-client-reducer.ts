import { ArgOrExecption, Method } from '@vality/thrift-ts';

import { createThriftInstance } from './create-thrift-instance';
import { ThriftAstMetadata, Connection } from './types';
import { callThriftService } from './call-thrift-service';
import { thriftInstanceToObject } from './thrift-instance-to-object';

export type ThriftContext = any;

const createArgInstances = (
    argObjects: object[],
    argsMetadata: ArgOrExecption[],
    metadata: ThriftAstMetadata[],
    namespace: string,
    context: ThriftContext
) =>
    argObjects.map((argObj, id) => {
        const type = argsMetadata[id].type;
        return createThriftInstance(metadata, context, namespace, type, argObj);
    });

export const codegenClientReducer =
    <T>(
        connection: Connection,
        meta: ThriftAstMetadata[],
        { serviceName, namespace }: { serviceName: string; namespace: string },
        context: ThriftContext,
        logging?: boolean
    ) =>
    (acc: T, methodMeta: Method) => ({
        ...acc,
        [methodMeta.name]: async (...objectArgs: object[]): Promise<object> => {
            const { name, args, type } = methodMeta;
            const thriftArgs = createArgInstances(objectArgs, args, meta, namespace, context);
            const thriftResponse = await callThriftService(connection, name, thriftArgs, {
                namespace,
                serviceName,
            });
            const response = thriftInstanceToObject(meta, namespace, type, thriftResponse);
            if (logging) {
                console.info(`📨 ${namespace}.${serviceName}.${name}`, {
                    args: objectArgs,
                    response,
                    methodMeta,
                });
            }
            return response;
        },
    });
