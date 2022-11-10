import { JsonAST } from '@vality/thrift-ts';
export interface ThriftAstMetadata {
    path: string;
    name: string;
    ast: JsonAST;
}
