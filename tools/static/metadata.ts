import { ThriftAstMetadata } from './utils/types';

let METADATA: Promise<ThriftAstMetadata[]> | null = null;
export const getMetadata = async (): Promise<ThriftAstMetadata[]> => {
    if (!METADATA) METADATA = import('./internal/metadata').then((m) => m.metadata);
    return await METADATA;
};
