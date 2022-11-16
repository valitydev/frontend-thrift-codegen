import type { ListType, MapType, SetType, ThriftType, ValueType } from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts';
export declare const PRIMITIVE_TYPES: readonly ["int", "bool", "i8", "i16", "i32", "i64", "string", "double", "binary"];
export declare function isThriftObject(value: any): boolean;
export declare function isComplexType(type: ValueType): type is SetType | ListType | MapType;
export declare function isPrimitiveType(type: ValueType): type is ThriftType;
export declare const STRUCTURE_TYPES: readonly ["typedef", "struct", "union", "exception", "enum"];
export declare type StructureType = typeof STRUCTURE_TYPES[number];
export interface NamespaceObjectType {
    namespaceMetadata: any;
    objectType: StructureType;
    include: JsonAST['include'];
}
export declare function parseNamespaceObjectType(metadata: any[], namespace: string, type: string, include?: JsonAST['include']): NamespaceObjectType;
export interface NamespaceType<T extends ValueType = ValueType> {
    namespace: string;
    type: T;
}
export declare function parseNamespaceType<T extends ValueType>(type: T, namespace: string): NamespaceType<T>;
