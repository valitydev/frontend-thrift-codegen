export * from './utils/types';
export * from './utils/generate-id';

let METADATA = null;
export const getMetadata = async () => {
    if (!METADATA) METADATA = await import('./internal/metadata').then((m) => m.metadata);
    return METADATA;
};

__export__;
