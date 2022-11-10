import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';
export declare type Connection = any;
export declare type ThriftService = any;
export interface ConnectOptions {
    path: string;
    headers?: KeyValue;
    deadlineConfig?: DeadlineConfig;
}
export declare const connect: ({ path, headers, deadlineConfig }: ConnectOptions, service: ThriftService) => Promise<Connection>;
