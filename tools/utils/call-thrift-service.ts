import isNil from 'lodash-es/isNil';

const TIMEOUT_MS = 60_000;

const later = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

export const callThriftService = (
    connection: any,
    methodName: string,
    args: any[]
) => {
    const serviceMethod = connection[methodName];
    if (isNil(serviceMethod)) {
        throw new Error(
            `Service method: "${methodName}" is not found in thrift client`
        );
    }
    return Promise.race([
        later(TIMEOUT_MS).then(() => {
            throw new Error(`Service method ${methodName} call timeout`);
        }),
        new Promise((resolve, reject) => {
            serviceMethod.call(
                connection,
                ...args,
                (err: unknown, result: unknown) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        }),
    ]);
};
