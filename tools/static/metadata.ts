import { defer, Observable, shareReplay } from 'rxjs';
import { ThriftAstMetadata } from './utils/types';

export const metadata$: Observable<ThriftAstMetadata[]> = defer(() =>
    import('./internal/metadata').then((m) => m.metadata),
).pipe(shareReplay(1));
