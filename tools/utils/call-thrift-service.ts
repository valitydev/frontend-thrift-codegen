const TIMEOUT_MS = 60_000;

const later = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export interface ErrorLoggingContext {
    namespace: string;
    serviceName: string;
}

export const callThriftService = (
    connection: any,
    methodName: string,
    args: any[],
    { namespace, serviceName }: ErrorLoggingContext
) => {
    const serviceMethod = connection[methodName];
    if (serviceMethod === null || serviceMethod === undefined) {
        throw new Error(`Service method: "${methodName}" is not found in thrift client`);
    }
    return Promise.race([
        later(TIMEOUT_MS).then(() => {
            throw new Error(`Service method ${methodName} call timeout`);
        }),
        new Promise((resolve, reject) => {
            serviceMethod.call(connection, ...args, (err: unknown, result: unknown) => {
                if (err) {
                    console.error(`😞 ${namespace}.${serviceName}.${methodName}`, {
                        err,
                        args,
                    });
                    reject(err);
                }
                resolve(result);
            });
        }),
    ]);
};
