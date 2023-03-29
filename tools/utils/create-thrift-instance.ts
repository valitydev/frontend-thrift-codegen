import type { Field, JsonAST, ValueType } from '@vality/thrift-ts';
import Int64 from '@vality/thrift-ts/lib/int64';

import {
    isComplexType,
    isPrimitiveType,
    isThriftObject,
    parseNamespaceType,
    parseNamespaceObjectType,
} from './namespace-type';
import { ThriftAstMetadata } from './types';

const toInt64 = (value: number, safeRangeCheck: boolean): Int64 => {
    if (safeRangeCheck && (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)) {
        throw new Error('Number is out of range');
    }
    return new Int64(value);
};

export function createThriftInstance<V>(
    metadata: ThriftAstMetadata[],
    instanceContext: any,
    namespaceName: string,
    indefiniteType: ValueType,
    value: any,
    i64SafeRangeCheck: boolean,
    include?: JsonAST['include']
): any {
    if (isThriftObject(value)) {
        return value;
    }
    const { namespace, type } = parseNamespaceType(indefiniteType, namespaceName);
    const internalCreateThriftInstance = (t: ValueType, v: V, include: JsonAST['include']) =>
        createThriftInstance(
            metadata,
            instanceContext,
            namespace,
            t,
            v,
            i64SafeRangeCheck,
            include
        );
    if (isComplexType(type)) {
        switch (type.name) {
            case 'map':
                return new Map(
                    Array.from(value as unknown as Map<any, any>).map(([k, v]) => [
                        internalCreateThriftInstance(type.keyType, k, include),
                        internalCreateThriftInstance(type.valueType, v, include),
                    ])
                ) as unknown as V;
            case 'list':
                return (value as unknown as any[]).map((v) =>
                    internalCreateThriftInstance(type.valueType, v, include)
                ) as unknown as V;
            case 'set':
                return Array.from(value as unknown as Set<any>).map((v) =>
                    internalCreateThriftInstance(type.valueType, v, include)
                ) as unknown as V;
            default:
                throw new Error('Unknown complex thrift type');
        }
    } else if (isPrimitiveType(type)) {
        switch (type) {
            case 'i64':
                return toInt64(value, i64SafeRangeCheck);
            default:
                return value;
        }
    }
    const {
        namespaceMetadata,
        objectType,
        include: objectInclude,
    } = parseNamespaceObjectType(metadata, namespace, type, include);
    switch (objectType) {
        case 'enum':
            return value;
        case 'exception':
            throw new Error('Unsupported structure type: exception');
        default: {
            const typeMeta = namespaceMetadata.ast[objectType][type];
            try {
                if (objectType === 'typedef') {
                    const typedefMeta = (typeMeta as { type: ValueType }).type;
                    return internalCreateThriftInstance(typedefMeta, value, objectInclude);
                }
                const instance = new instanceContext[namespace][type]();
                for (const [k, v] of Object.entries(value as any)) {
                    type StructOrUnionType = Field[];
                    const fieldTypeMeta = (typeMeta as StructOrUnionType).find((m) => m.name === k);
                    if (!fieldTypeMeta) {
                        throw new Error('fieldTypeMeta is null');
                    }
                    instance[k] = internalCreateThriftInstance(
                        fieldTypeMeta.type,
                        v as any,
                        objectInclude
                    );
                }
                return instance;
            } catch (error) {
                console.error(
                    'Thrift structure',
                    objectType,
                    'creation error:',
                    namespace,
                    type,
                    '(meta type:',
                    typeMeta,
                    '), value:',
                    value
                );
                throw error;
            }
        }
    }
}
