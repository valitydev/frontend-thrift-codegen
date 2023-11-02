function inherits(ctor, superCtor) {
    if (ctor === undefined || ctor === null) {
        throw new TypeError('The constructor to `inherits` must not be null or undefined.');
    }

    if (superCtor === undefined || superCtor === null) {
        throw new TypeError('The super constructor to `inherits` must not be null or undefined.');
    }

    if (superCtor.prototype === undefined) {
        throw new TypeError('The super constructor to `inherits` must have a prototype.');
    }

    // Set up the prototype chain
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true,
        },
    });
}

var Type = (exports.Type = {
    STOP: 0,
    VOID: 1,
    BOOL: 2,
    BYTE: 3,
    I08: 3,
    DOUBLE: 4,
    I16: 6,
    I32: 8,
    I64: 10,
    STRING: 11,
    UTF7: 11,
    STRUCT: 12,
    MAP: 13,
    SET: 14,
    LIST: 15,
    UTF8: 16,
    UTF16: 17,
});

exports.MessageType = {
    CALL: 1,
    REPLY: 2,
    EXCEPTION: 3,
    ONEWAY: 4,
};

exports.TException = TException;

function TException(message) {
    Error.call(this);
    // Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}
inherits(TException, Error);

var TApplicationExceptionType = (exports.TApplicationExceptionType = {
    UNKNOWN: 0,
    UNKNOWN_METHOD: 1,
    INVALID_MESSAGE_TYPE: 2,
    WRONG_METHOD_NAME: 3,
    BAD_SEQUENCE_ID: 4,
    MISSING_RESULT: 5,
    INTERNAL_ERROR: 6,
    PROTOCOL_ERROR: 7,
    INVALID_TRANSFORM: 8,
    INVALID_PROTOCOL: 9,
    UNSUPPORTED_CLIENT_TYPE: 10,
});

exports.TApplicationException = TApplicationException;

function TApplicationException(type, message) {
    TException.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.type = type || TApplicationExceptionType.UNKNOWN;
    this.name = this.constructor.name;
    this.message = message;
}
inherits(TApplicationException, TException);

TApplicationException.prototype.read = function (input) {
    var ret = input.readStructBegin('TApplicationException');

    while (1) {
        ret = input.readFieldBegin();
        if (ret.ftype == Type.STOP) break;

        switch (ret.fid) {
            case 1:
                if (ret.ftype == Type.STRING) {
                    ret = input.readString();
                    this.message = ret;
                } else {
                    ret = input.skip(ret.ftype);
                }
                break;
            case 2:
                if (ret.ftype == Type.I32) {
                    ret = input.readI32();
                    this.type = ret;
                } else {
                    ret = input.skip(ret.ftype);
                }
                break;
            default:
                ret = input.skip(ret.ftype);
                break;
        }
        input.readFieldEnd();
    }
    input.readStructEnd();
};

TApplicationException.prototype.write = function (output) {
    output.writeStructBegin('TApplicationException');

    if (this.message) {
        output.writeFieldBegin('message', Type.STRING, 1);
        output.writeString(this.message);
        output.writeFieldEnd();
    }

    if (this.code) {
        output.writeFieldBegin('type', Type.I32, 2);
        output.writeI32(this.code);
        output.writeFieldEnd();
    }

    output.writeFieldStop();
    output.writeStructEnd();
};

exports.TProtocolException = TProtocolException;

function TProtocolException(type, message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.type = type;
    this.message = message;
}
inherits(TProtocolException, Error);

exports.objectLength = function (obj) {
    return Object.keys(obj).length;
};

exports.inherits = function (constructor, superConstructor) {
    inherits(constructor, superConstructor);
};

var copyList, copyMap;

copyList = function (lst, types) {
    if (!lst) {
        return lst;
    }

    var type;

    if (types.shift === undefined) {
        type = types;
    } else {
        type = types[0];
    }
    var Type = type;

    var len = lst.length,
        result = [],
        i,
        val;
    for (i = 0; i < len; i++) {
        val = lst[i];
        if (type === null) {
            result.push(val);
        } else if (type === copyMap || type === copyList) {
            result.push(type(val, types.slice(1)));
        } else {
            result.push(new Type(val));
        }
    }
    return result;
};

copyMap = function (obj, types) {
    if (!obj) {
        return obj;
    }

    var type;

    if (types.shift === undefined) {
        type = types;
    } else {
        type = types[0];
    }
    var Type = type;

    var result = new Map();

    obj.forEach((val, prop) => {
        if (type === null) {
            result.set(prop, val);
        } else if (type === copyMap || type === copyList) {
            result.set(prop, type(val, types.slice(1)));
        } else {
            result.set(prop, new Type(val));
        }
    });
    return result;
};

module.exports.copyMap = copyMap;
module.exports.copyList = copyList;
