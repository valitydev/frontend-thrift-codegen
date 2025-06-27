import Int64 from '@vality/thrift-ts/lib/int64';
import { thriftInstanceToObject } from '../tools/static/utils/thrift-instance-to-object';

describe('thriftInstanceToObject', () => {
    const metadata = [
        {
            path: 'base.thrift',
            name: 'base',
            ast: {
                struct: {
                    Rational: [
                        {
                            type: 'i64',
                            name: 'p',
                        },
                        {
                            type: 'i64',
                            name: 'q',
                        },
                    ],
                },
            },
        },
    ];

    test('convert large i64 to number', () => {
        const value = {
            p: new Int64(1000),
            q: new Int64(1000000000000000000),
        };

        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = thriftInstanceToObject(metadata, 'base', 'Rational', value);

        const expected = {
            p: 1000,
            q: 1000000000000000000,
        };

        expect(warnSpy).toHaveBeenCalled();
        expect(result).toStrictEqual(expected);

        warnSpy.mockRestore();
    });
});
