const later = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

interface CallInfo {
    namespace: string;
    serviceName: string;
    name: string;
    args: object[];
    headers: object;
}

export class ThriftServiceError<T = null> extends Error {
    constructor(
        public info: CallInfo,
        public error: T = null,
    ) {
        super(
            `Thrift service method ${info.namespace}.${info.serviceName}.${info.name} call failed`,
        );
        this.name = 'ThriftServiceError';
    }
}

export class ThriftServiceNotFoundError extends ThriftServiceError {
    constructor(public info: CallInfo) {
        super(info);
        this.name = 'ThriftServiceNotFoundError';
        this.message = `Thrift service method ${info.namespace}.${info.serviceName}.${info.name} not found`;
    }
}

export class ThriftServiceTimeoutError extends ThriftServiceError {
    constructor(
        public info: CallInfo,
        timeout: number,
    ) {
        super(info);
        this.name = 'ThriftServiceTimeoutError';
        this.message = `Thrift service method ${info.namespace}.${info.serviceName}.${info.name} call timed out after ${timeout}ms`;
    }
}

export const callThriftService = (
    info: CallInfo,
    connection: any,
    args: any[],
    timeout: number = 60_000,
) => {
    const serviceMethod = connection[info.name];
    if (!serviceMethod) {
        throw new ThriftServiceNotFoundError(info);
    }
    return Promise.race([
        later(timeout).then(() => {
            throw new ThriftServiceTimeoutError(info, timeout);
        }),
        new Promise((resolve, reject) => {
            serviceMethod.call(connection, ...args, (exception: unknown, result: unknown) => {
                if (exception) {
                    reject(new ThriftServiceError(info, exception));
                }
                resolve(result);
            });
        }),
    ]);
};
