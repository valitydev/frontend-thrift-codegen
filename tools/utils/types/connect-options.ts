import { ThriftAstMetadata } from './thrift-ast-metadata';

export interface KeyValue {
    [key: string]: any;
}

export interface ConnectOptions {
    metadata: ThriftAstMetadata[];
    headers: KeyValue;
    path: string;
    logging?: boolean;
    i64SafeRangeCheck?: boolean;
    hostname?: string;
    port?: string;
    https?: boolean;
}
