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
        namespace: string,
        context: ThriftContext
    ) =>
    (acc: T, { name, args, type }: Method) => ({
        ...acc,
        [name]: async (...objectArgs: object[]): Promise<object> => {
            const thriftArgs = createArgInstances(objectArgs, args, meta, namespace, context);
            const thriftResponse = await callThriftService(connection, name, thriftArgs);
            return thriftInstanceToObject(meta, namespace, type, thriftResponse);
        },
    });
