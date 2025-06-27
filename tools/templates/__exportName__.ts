import { Observable, shareReplay, switchMap } from 'rxjs';

import { getMetadata } from './metadata';

import { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';
import context from './internal/__namespace__/context';
import * as service from './internal/__namespace__/gen-nodejs/__serviceName__';

import { getMethodsMetadata, codegenClientReducer } from '__utilsPath__';
import { ConnectOptions } from '__utilsPath__/types';

export { CodegenClient as __exportName__CodegenClient } from './internal/__namespace__-__serviceName__';

export const __exportName__ = async (
    options: ConnectOptions,
): Promise<__exportName__CodegenClient> => {
    const metadata = await getMetadata();
    const serviceName = '__serviceName__';
    const namespace = '__namespace__';
    const methodsMeta = getMethodsMetadata(metadata, namespace, serviceName);
    const connectionContext = {
        path: options.path ?? '/',
        service,
        headers: options.headers,
        hostname: options.hostname,
        port: options.port,
        https: options.https,
    };
    const clientSettings = {
        namespace,
        serviceName,
        logging: options.logging || false,
        loggingFn: options.loggingFn,
        i64SafeRangeCheck: options.i64SafeRangeCheck || true,
    };
    return methodsMeta.reduce(
        codegenClientReducer<__exportName__CodegenClient>(
            connectionContext,
            metadata,
            clientSettings,
            context,
        ),
        {} as __exportName__CodegenClient,
    );
};

export class __exportName__(pascalCase)Service {
    protected client$: Observable<__exportName__CodegenClient>;

    constructor(connectOptions$: Observable<ConnectOptions>) {
        this.client$ = connectOptions$.pipe(
            switchMap((params) => __exportName__(params)),
            shareReplay({refCount: true, bufferSize: 1}),
        );
    }

    __methods__
}
