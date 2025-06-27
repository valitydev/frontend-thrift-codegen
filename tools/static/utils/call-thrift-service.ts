const TIMEOUT_MS = 60_000;

const later = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const callThriftService = (connection: any, methodName: string, args: any[]) => {
    const serviceMethod = connection[methodName];
    if (serviceMethod === null || serviceMethod === undefined) {
        throw new Error(`Service method: "${methodName}" is not found in thrift client`);
    }
    return Promise.race([
        later(TIMEOUT_MS).then(() => {
            throw new Error(`Service method ${methodName} call timeout`);
        }),
        new Promise((resolve, reject) => {
            serviceMethod.call(connection, ...args, (exception: unknown, result: unknown) => {
                if (exception) {
                    reject(exception);
                }
                resolve(result);
            });
        }),
    ]);
};
