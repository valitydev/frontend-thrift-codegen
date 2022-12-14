import type { Field, Int64, JsonAST, ValueType } from '@vality/thrift-ts';

import {
    isComplexType,
    isPrimitiveType,
    parseNamespaceType,
    parseNamespaceObjectType,
} from './namespace-type';
import { ThriftAstMetadata } from './types';

export function thriftInstanceToObject(
    metadata: ThriftAstMetadata[],
    namespaceName: string,
    indefiniteType: ValueType,
    value: any,
    include?: JsonAST['include']
): any {
    if (typeof value !== 'object' || value === null || value === undefined) {
        return value;
    }
    const { namespace, type } = parseNamespaceType(indefiniteType, namespaceName);
    const internalThriftInstanceToObject = (t: ValueType, v: any, include: JsonAST['include']) =>
        thriftInstanceToObject(metadata, namespace, t, v, include);
    if (isComplexType(type)) {
        switch (type.name) {
            case 'map':
                return new Map(
                    Array.from(value as unknown as Map<any, any>).map(([k, v]) => [
                        internalThriftInstanceToObject(type.keyType, k, include),
                        internalThriftInstanceToObject(type.valueType, v, include),
                    ])
                ) as unknown;
            case 'list':
                return (value as unknown as any[]).map((v) =>
                    internalThriftInstanceToObject(type.valueType, v, include)
                ) as unknown;
            case 'set':
                return new Set(
                    Array.from(value as unknown as Set<any>).map((v) =>
                        internalThriftInstanceToObject(type.valueType, v, include)
                    )
                ) as unknown;
            default:
                throw new Error('Unknown complex thrift type');
        }
    } else if (isPrimitiveType(type)) {
        switch (type) {
            case 'i64':
                return (value as unknown as Int64).toNumber() as unknown;
            default:
                return value;
        }
    }
    const {
        namespaceMetadata,
        objectType,
        include: objectInclude,
    } = parseNamespaceObjectType(metadata, namespace, type);
    const typeMeta = namespaceMetadata.ast[objectType][type];
    switch (objectType) {
        case 'exception':
            throw new Error('Unsupported structure type: exception');
        case 'typedef': {
            type TypedefType = {
                type: ValueType;
            };
            return internalThriftInstanceToObject(
                (typeMeta as TypedefType).type,
                value,
                objectInclude
            );
        }
        case 'union': {
            const entries: any = Object.entries(value).find(([, v]) => v !== null);
            const [key, val] = entries;
            type UnionType = Field[];
            const fieldTypeMeta = (typeMeta as UnionType).find((m) => m.name === key);
            if (!fieldTypeMeta) {
                throw new Error('fieldTypeMeta is null');
            }
            return {
                [key]: internalThriftInstanceToObject(fieldTypeMeta.type, val, objectInclude),
            } as any;
        }
        default: {
            const result: any = {};
            for (const [k, v] of Object.entries(value)) {
                type StructType = Field[];
                const fieldTypeMeta = (typeMeta as StructType).find((m) => m.name === k);
                if (!fieldTypeMeta) {
                    throw new Error('fieldTypeMeta is null');
                }
                if (v !== null && v !== undefined) {
                    result[k] = internalThriftInstanceToObject(
                        fieldTypeMeta.type,
                        v,
                        objectInclude
                    );
                }
            }
            return result;
        }
    }
}
