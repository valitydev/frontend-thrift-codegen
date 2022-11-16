import type { JsonAST, ValueType } from '@vality/thrift-ts';
import { ThriftAstMetadata } from './types';
export declare function thriftInstanceToObject(metadata: ThriftAstMetadata[], namespaceName: string, indefiniteType: ValueType, value: any, include?: JsonAST['include']): any;
