import connectClient from '@vality/woody';
import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';
import { ThriftAstMetadata } from './types';

export type Connection = any;
export type ThriftService = any;

export interface ConnectOptions {
    path: string;
    metadata: ThriftAstMetadata[];
    headers?: KeyValue;
    deadlineConfig?: DeadlineConfig;
}

export const connect = async (
    { path, headers, deadlineConfig }: ConnectOptions,
    service: ThriftService
): Promise<Connection> => {
    return new Promise((resolve, reject) => {
        const connection = connectClient(
            location.hostname,
            location.port,
            path,
            service,
            {
                headers,
                deadlineConfig,
            },
            (err: any) => reject(err)
        );
        resolve(connection);
    });
};
