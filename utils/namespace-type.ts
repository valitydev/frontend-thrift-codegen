import type {
    ListType,
    MapType,
    SetType,
    ThriftType,
    ValueType,
} from '@vality/thrift-ts';
import { JsonAST } from '@vality/thrift-ts';

export const PRIMITIVE_TYPES = [
    'int',
    'bool',
    'i8',
    'i16',
    'i32',
    'i64',
    'string',
    'double',
    'binary',
] as const;

export function isThriftObject(value: any): boolean {
    return (
        typeof value?.write === 'function' && typeof value?.read === 'function'
    );
}

export function isComplexType(
    type: ValueType
): type is SetType | ListType | MapType {
    return typeof type === 'object';
}

export function isPrimitiveType(type: ValueType): type is ThriftType {
    return PRIMITIVE_TYPES.includes(type as never);
}

export const STRUCTURE_TYPES = [
    'typedef',
    'struct',
    'union',
    'exception',
    'enum',
] as const;
export type StructureType = typeof STRUCTURE_TYPES[number];

export interface NamespaceObjectType {
    namespaceMetadata: any;
    objectType: StructureType;
    include: JsonAST['include'];
}

export function parseNamespaceObjectType(
    metadata: any[],
    namespace: string,
    type: string,
    include?: JsonAST['include']
): NamespaceObjectType {
    // metadata reverse find - search for the last matching protocol if the names match (files are overwritten in the same order)
    let namespaceMetadata: any;
    if (include)
        namespaceMetadata = metadata
            .reverse()
            .find((m) => m.path === include[namespace].path);
    if (!namespaceMetadata)
        namespaceMetadata = metadata
            .reverse()
            .find((m) => m.name === namespace);
    const objectType = (
        Object.keys(namespaceMetadata.ast) as StructureType[]
    ).find((t) => namespaceMetadata.ast[t][type]);
    if (!objectType || !STRUCTURE_TYPES.includes(objectType)) {
        throw new Error(`Unknown thrift structure type: ${objectType}`);
    }
    return {
        namespaceMetadata,
        objectType,
        include: {
            ...namespaceMetadata.ast.include,
            ...{ [namespace]: { path: namespaceMetadata.path } },
        },
    };
}

export interface NamespaceType<T extends ValueType = ValueType> {
    namespace: string;
    type: T;
}

export function parseNamespaceType<T extends ValueType>(
    type: T,
    namespace: string
): NamespaceType<T> {
    if (!isPrimitiveType(type) && !isComplexType(type) && type.includes('.')) {
        [namespace, type as unknown] = type.split('.');
    }
    return { namespace, type };
}
