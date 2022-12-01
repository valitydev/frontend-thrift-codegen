import connectClient from '@vality/woody';
import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';
import { Connection, ThriftService } from './types';

export const connect = async (
    path: string,
    service: ThriftService,
    headers?: KeyValue,
    deadlineConfig?: DeadlineConfig
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
