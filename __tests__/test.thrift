enum B {
    a
    b
}

struct A {
    1: optional B b
}

service Service {
    list<B> GetList(1: A a)
    A Get(1: B b)
}
