export interface KeyValue {
    [key: string]: any;
}

export interface ConnectOptions {
    headers: KeyValue;
    logging?: boolean;
    loggingFn?: () => void;
    i64SafeRangeCheck?: boolean;
    hostname?: string;
    port?: string;
    https?: boolean;
    path?: string;
}
