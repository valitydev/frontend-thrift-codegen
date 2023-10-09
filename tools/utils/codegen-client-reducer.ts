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
    hostname?: string;
    port?: string;
    headers?: KeyValue;
    deadlineConfig?: DeadlineConfig;
}

export interface ClientSettings {
    serviceName: string;
    namespace: string;
    logging: boolean;
    i64SafeRangeCheck: boolean;
}

const createArgInstances = (
    argObjects: object[],
    argsMetadata: ArgOrExecption[],
    metadata: ThriftAstMetadata[],
    namespace: string,
    context: ThriftContext,
    i64SafeRangeCheck: boolean
) =>
    argObjects.map((argObj, id) => {
        const type = argsMetadata[id].type;
        return createThriftInstance(metadata, context, namespace, type, argObj, i64SafeRangeCheck);
    });

export const codegenClientReducer =
    <T>(
        { path, service, headers, deadlineConfig, hostname, port }: ConnectionContext,
        meta: ThriftAstMetadata[],
        { serviceName, namespace, logging, i64SafeRangeCheck }: ClientSettings,
        context: ThriftContext
    ) =>
    (acc: T, { name, args, type }: Method) => ({
        ...acc,
        [name]: async (...objectArgs: object[]): Promise<object> => {
            const thriftMethod = (): Promise<object> =>
                new Promise(async (resolve, reject) => {
                    try {
                        const thriftArgs = createArgInstances(
                            objectArgs,
                            args,
                            meta,
                            namespace,
                            context,
                            i64SafeRangeCheck
                        );
                        /**
                         * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
                         * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
                         */
                        const connection = connectClient(
                            hostname ?? location.hostname,
                            port ?? (hostname ? undefined : location.port),
                            path,
                            service,
                            {
                                headers,
                                deadlineConfig,
                            },
                            (err) => {
                                reject(err);
                            }
                        ) as any;
                        const thriftResponse = await callThriftService(
                            connection,
                            name,
                            thriftArgs
                        );
                        const response = thriftInstanceToObject(
                            meta,
                            namespace,
                            type,
                            thriftResponse
                        );
                        if (logging) {
                            console.info(`🟢 ${namespace}.${serviceName}.${name}`, {
                                args: objectArgs,
                                response,
                                headers
                            });
                        }
                        resolve(response);
                    } catch (ex) {
                        reject(ex);
                    }
                });
            try {
                return await thriftMethod();
            } catch (error: any) {
                if (logging) {
                    console.error(`🔴 ${namespace}.${serviceName}.${name}`, {
                        args: objectArgs,
                        error,
                        headers
                    });
                }
                throw error;
            }
        },
    });
