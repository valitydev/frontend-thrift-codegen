import { DeadlineConfig, KeyValue } from '@vality/woody/src/connect-options';
import { ThriftAstMetadata } from './thrift-ast-metadata';

export interface ConnectOptions {
    metadata: ThriftAstMetadata[];
    headers: KeyValue;
    path?: string;
    deadlineConfig?: DeadlineConfig;
}
