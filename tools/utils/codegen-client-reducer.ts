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
        {
            serviceName,
            namespace,
            logging,
        }: { serviceName: string; namespace: string; logging: boolean },
        context: ThriftContext
    ) =>
    (acc: T, { name, args, type }: Method) => ({
        ...acc,
        [name]: async (...objectArgs: object[]): Promise<object> => {
            const thriftArgs = createArgInstances(objectArgs, args, meta, namespace, context);
            const thriftResponse = await callThriftService(connection, name, thriftArgs, {
                namespace,
                serviceName,
            });
            const response = thriftInstanceToObject(meta, namespace, type, thriftResponse);
            if (logging) {
                console.info(`🟢 ${namespace}.${serviceName}.${name}`, {
                    args: objectArgs,
                    response,
                });
            }
            return response;
        },
    });
