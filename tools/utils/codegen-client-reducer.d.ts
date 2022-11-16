import { Method } from '@vality/thrift-ts';
import { ThriftAstMetadata } from './types';
import { Connection } from './connect';
export declare type ThriftContext = any;
export declare const codegenClientReducer: <T>(connection: Connection, meta: ThriftAstMetadata[], namespace: string, context: ThriftContext) => (acc: T, { name, args, type }: Method) => T & {
    [x: string]: (...objectArgs: object[]) => Promise<object>;
};
