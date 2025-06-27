import Int64 from '@vality/thrift-ts/lib/int64';
import { createThriftInstance } from '../tools/static/utils/create-thrift-instance';

describe('createThriftInstance', () => {
    // Codegen Rational mock. Copied from result of codegeneration.
    function Rational(args) {
        this.p = null;
        this.q = null;
        if (args) {
            if (args.p !== undefined && args.p !== null) {
                this.p = args.p;
            }
            if (args.q !== undefined && args.q !== null) {
                this.q = args.q;
            }
        }
    }

    const instanceContext = {
        base: {
            Rational,
        },
    };

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

    describe('with i64 save range check', () => {
        const i64SafeRangeCheck = true;

        test('create out of range integer', () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const value = {
                p: 1000,
                q: 1000000000000000000,
            };

            expect(() =>
                createThriftInstance(
                    metadata,
                    instanceContext,
                    'base',
                    'Rational',
                    value,
                    i64SafeRangeCheck,
                ),
            ).toThrow('Number is out of range');
            expect(errorSpy).toHaveBeenCalled();

            errorSpy.mockRestore();
        });

        test('create in range integer', () => {
            const value = {
                p: 1000,
                q: 900719925474099,
            };

            const result = createThriftInstance(
                metadata,
                instanceContext,
                'base',
                'Rational',
                value,
                i64SafeRangeCheck,
            );

            const expected = new Rational({
                p: new Int64(1000),
                q: new Int64(900719925474099),
            });
            expect(result).toStrictEqual(expected);
        });
    });

    describe('without i64 save range check', () => {
        const i64SafeRangeCheck = false;

        test('create out of range integer', () => {
            const value = {
                p: 1000,
                q: 1000000000000000000,
            };

            const result = createThriftInstance(
                metadata,
                instanceContext,
                'base',
                'Rational',
                value,
                i64SafeRangeCheck,
            );

            const expected = new Rational({
                p: new Int64(1000),
                q: new Int64(1000000000000000000),
            });
            expect(result).toStrictEqual(expected);
        });
    });
});
