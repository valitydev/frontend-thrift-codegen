# Frontend Thrift Codegen CLI

This project allows generation of JS client library, typings and json metadata automatically given a thrift spec.

## Usage

```
thrift-codegen [options]
```

Options:

```
  -i, --inputs      List of thrift file folders for compilation. [array] [required]
  -n, --namespaces  List of service namespaces which will be included. [array] [required]
  -t, --types       List of types namespaces witch will be exported. [array] [required]
  -p, --path        Default service connection path. [string] [required]
```

## Testing

-   Copy thrift spec to `proto` directory. For example [damsel](https://github.com/valitydev/damsel).

-   Run

        npm run codegen -- --i ./proto --n domain_config --t domain_config domain --p /wachter

-   Codegen client will be available in `dist` directory.
