import connectClient from '@vality/woody';
import { Connection, ConnectOptions, ThriftService } from './types';

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
