import type { JsonAST, ValueType } from '@vality/thrift-ts';
import { ThriftAstMetadata } from './types';
export declare function createThriftInstance<V>(metadata: ThriftAstMetadata[], instanceContext: any, namespaceName: string, indefiniteType: ValueType, value: V, include?: JsonAST['include']): V;
