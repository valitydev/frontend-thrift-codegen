import { ArgOrExecption, Method } from '@vality/thrift-ts';
import connectClient from '@vality/woody';
import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';

import { createThriftInstance } from './create-thrift-instance';
import { ThriftAstMetadata, ThriftService } from './types';
import { callThriftService } from './call-thrift-service';
import { thriftInstanceToObject } from './thrift-instance-to-object';

export type ThriftContext = any;

export interface ConnectionContext {
    path: string;
    service: ThriftService;
    headers?: KeyValue;
    deadlineConfig?: DeadlineConfig;
}

export interface LoggingContext {
    serviceName: string;
    namespace: string;
    logging: boolean;
}

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
        { path, service, headers, deadlineConfig }: ConnectionContext,
        meta: ThriftAstMetadata[],
        { serviceName, namespace, logging }: LoggingContext,
        context: ThriftContext
    ) =>
    (acc: T, { name, args, type }: Method) => ({
        ...acc,
        [name]: async (...objectArgs: object[]): Promise<object> => {
            try {
                /**
                 * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
                 * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
                 */
                const connection = connectClient(
                    location.hostname,
                    location.port,
                    path,
                    service,
                    {
                        headers,
                        deadlineConfig,
                    },
                    () => {}
                );
                const thriftArgs = createArgInstances(objectArgs, args, meta, namespace, context);
                const thriftResponse = await callThriftService(connection, name, thriftArgs);
                const response = thriftInstanceToObject(meta, namespace, type, thriftResponse);
                if (logging) {
                    console.info(`🟢 ${namespace}.${serviceName}.${name}`, {
                        args: objectArgs,
                        response,
                    });
                }
                return response;
            } catch (error: any) {
                console.error(`🔴 ${namespace}.${serviceName}.${name}`, {
                    error,
                    args,
                });
                throw error;
            }
        },
    });
