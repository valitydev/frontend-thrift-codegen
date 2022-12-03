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
            try {
                serviceMethod.call(connection, ...args, (exception: unknown, result: unknown) => {
                    if (exception) {
                        console.error(`🔴 ${namespace}.${serviceName}.${methodName}`, {
                            exception,
                            args,
                        });
                        reject(exception);
                    }
                    resolve(result);
                });
            } catch (error) {
                console.error(`🔴 ${namespace}.${serviceName}.${methodName}`, {
                    error,
                    args,
                });
                reject(error);
            }
        }),
    ]);
};
