include "dep/dep.thrift"

enum TestEnum {
    a
    b
}

struct TestStruct {
    1: optional TestEnum enumValue
    2: optional dep.Dep depValue
}

service TestServiceA {
    list<TestEnum> GetList(1: TestStruct structArg)
    TestStruct Get(1: TestEnum enumArg)
}

service TestServiceB {
    dep.Dep Get(1: TestStruct structArg)
}
