# Frontend Thrift Codegen CLI

This project allows generation of JS client library, typings and json metadata automatically given a thrift spec.

## Usage

```sh
thrift-codegen [options]
```

Options:

- `-i, --inputs` - List of thrift file folders for compilation. [array] [required]
- `-n, --namespaces` - List of service namespaces which will be included. [array] [required]

## Testing

- Copy thrift spec to `proto` directory. For example [damsel](https://github.com/valitydev/damsel).

- Run

```sh
npm run codegen -- --i ./proto --n domain_config
```

- Codegen client will be available in `dist` directory.
