import { ArgOrExecption, Method } from '@vality/thrift-ts';
import connectClient from '@vality/woody';

import { createThriftInstance } from './create-thrift-instance';
import { ConnectOptions, LogFn, ThriftAstMetadata, ThriftService } from './types';
import { callThriftService } from './call-thrift-service';
import { thriftInstanceToObject } from './thrift-instance-to-object';

export type ThriftContext = any;

export interface ConnectionContext {
    path: string;
    service: ThriftService;
    hostname?: string;
    port?: string;
    https?: boolean;
}

export interface ClientSettings {
    serviceName: string;
    namespace: string;
    logging: boolean;
    loggingFn?: LogFn;
    i64SafeRangeCheck: boolean;
    timeout: number;
}

const createArgInstances = (
    argObjects: object[],
    argsMetadata: ArgOrExecption[],
    metadata: ThriftAstMetadata[],
    namespace: string,
    context: ThriftContext,
    i64SafeRangeCheck: boolean,
) =>
    argObjects.map((argObj, id) => {
        const type = argsMetadata[id].type;
        return createThriftInstance(metadata, context, namespace, type, argObj, i64SafeRangeCheck);
    });

const defaultLogFn: LogFn = ({
    type,
    namespace,
    serviceName,
    name,
    args,
    response,
    error,
    headers,
}) => {
    switch (type) {
        case 'success':
            console.info(`🟢 ${namespace}.${serviceName}.${name}`, {
                args,
                response,
                headers,
            });
            return;
        case 'error':
            console.error(`🔴 ${namespace}.${serviceName}.${name}`, {
                args,
                error,
                headers,
            });
    }
};

export const codegenClientReducer = <T>(
    clientOptions: ConnectOptions,
    // TODO: remove other options
    { path, service, hostname, port, https }: ConnectionContext,
    meta: ThriftAstMetadata[],
    { serviceName, namespace, logging, loggingFn, i64SafeRangeCheck, timeout }: ClientSettings,
    context: ThriftContext,
) => {
    const mainHeaders = clientOptions.headers || {};

    const endpoint = hostname
        ? {
              hostname,
              port: port ?? '',
              https: https ?? true,
          }
        : {
              hostname: location.hostname,
              port: location.port,
              https: location.protocol === 'https:',
          };
    const logFn = loggingFn || defaultLogFn;
    return (acc: T, { name, args, type }: Method) => ({
        ...acc,
        [name]: async (...objectArgs: object[]): Promise<T> => {
            const headers = clientOptions.createCallOptions
                ? { ...mainHeaders, ...clientOptions.createCallOptions().headers }
                : mainHeaders;
            const mainLogData = {
                namespace,
                serviceName,
                name,
                args: objectArgs,
                headers,
            };

            const thriftMethod = (): Promise<T> =>
                new Promise(async (resolve, reject) => {
                    try {
                        const thriftArgs = createArgInstances(
                            objectArgs,
                            args,
                            meta,
                            namespace,
                            context,
                            i64SafeRangeCheck,
                        );
                        /**
                         * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
                         * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
                         */
                        const connection = connectClient(
                            endpoint.hostname,
                            endpoint.port,
                            path,
                            service,
                            {
                                headers,
                                https: endpoint.https,
                            },
                            (err) => {
                                reject(err);
                            },
                        ) as any;
                        logFn({ ...mainLogData, type: 'call' });
                        const thriftResponse = await callThriftService(
                            {
                                namespace,
                                serviceName,
                                name,
                                args: objectArgs,
                                headers,
                            },
                            connection,
                            thriftArgs,
                            timeout,
                        );
                        const response = thriftInstanceToObject(
                            meta,
                            namespace,
                            type,
                            thriftResponse,
                        );
                        if (logging || loggingFn) {
                            logFn({ ...mainLogData, response, type: 'success' });
                        }
                        resolve(response);
                    } catch (ex) {
                        reject(ex);
                    }
                });
            try {
                return await thriftMethod();
            } catch (error: any) {
                if (logging || loggingFn) {
                    logFn({ ...mainLogData, error, type: 'error' });
                }
                throw error;
            }
        },
    });
};
