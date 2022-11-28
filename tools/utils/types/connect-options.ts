import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';
import { ThriftAstMetadata } from './thrift-ast-metadata';

export interface ConnectOptions {
    path: string;
    metadata: ThriftAstMetadata[];
    headers?: KeyValue;
    deadlineConfig?: DeadlineConfig;
}
