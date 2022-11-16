import { Method } from '@vality/thrift-ts';
import { ThriftAstMetadata } from './types';
export declare const getMethodsMetadata: (metadata: ThriftAstMetadata[], namespace: string, serviceName: string) => Method[];
