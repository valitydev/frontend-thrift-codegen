export interface KeyValue {
    [key: string]: any;
}

export type LogFn = (params: {
    namespace: string;
    serviceName: string;
    name: string;
    args: object[];
    headers: KeyValue;
    type: 'success' | 'error' | 'call';
    response?: any;
    error?: any;
}) => void;

export interface ConnectOptions {
    headers: KeyValue;
    logging?: boolean;
    loggingFn?: LogFn;
    i64SafeRangeCheck?: boolean;
    hostname?: string;
    port?: string;
    https?: boolean;
    path?: string;
    timeout?: number; // ms

    createCallOptions?: () => {
        headers?: KeyValue;
    };
}
