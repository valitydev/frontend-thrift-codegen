const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const yargs = require('yargs');

async function execWithLog(cmd, cwd = process.cwd()) {
    console.log(`> ${cmd}`);
    return await new Promise((res, rej) =>
        exec(
            cmd,
            {
                cwd,
            },
            (error, stdout, stderr) => {
                if (error === null) {
                    console.log(stderr);
                    res(stdout);
                } else {
                    // console.error(error);
                    console.error(stderr);
                    rej(error);
                }
            }
        )
    );
}

async function codegen(protoPath, depsPaths, outputPath, onlyModel) {
    await execWithLog(`thrift-ts ${protoPath} -o ${outputPath} -d false`);
    if (!onlyModel) {
        const name = path.parse(protoPath).name;
        const namedPath = path.join(outputPath, name);
        fs.mkdirSync(namedPath, { recursive: true });
        await execWithLog(
            `thrift -r -gen js:node -o ${namedPath} ${depsPaths
                .map((dep) => `-I ${dep}`)
                .join(' ')} ${protoPath}`
        );
        await execWithLog(
            `thrift-ts ${protoPath} -o ${path.join(
                namedPath,
                'metadata.json'
            )} --json --pack --prettify`
        );
    }
}

async function codegenAll() {
    const argv = yargs.command('gen').argv;

    const PROTO_DIR = argv._[0] || './proto';
    const DEPS_DIRS = ['./node_modules', './node_modules/@vality'];
    const PROJECT_PATH = process.cwd();

    const PROTO_PATH = path.join(PROJECT_PATH, PROTO_DIR);
    const DIST_PATH = path.join(PROJECT_PATH, './dist');

    const depsPaths = DEPS_DIRS.map((depsDir) =>
        fs
            .readdirSync(path.join(PROJECT_PATH, depsDir))
            .map((dep) => path.join(PROJECT_PATH, depsDir, dep))
    )
        .flat()
        .filter((depPath) => {
            try {
                return fs.lstatSync(path.join(depPath, 'proto')).isDirectory();
            } catch (err) {
                return false;
            }
        });

    const protos = fs
        .readdirSync(PROTO_PATH)
        .filter((proto) => path.parse(proto).ext === '.thrift');

    const depsCodegens = [];
    for (const depPath of depsPaths) {
        const depsProtos = fs
            .readdirSync(path.join(depPath, 'proto'))
            .filter((proto) => path.parse(proto).ext === '.thrift');
        const protosPaths = depsProtos.map((proto) => path.join(depPath, 'proto', proto));
        for (const protoPath of protosPaths) {
            depsCodegens.push(codegen(protoPath, depsPaths, DIST_PATH));
        }
    }
    await Promise.all(depsCodegens);
    const codegens = [];
    for (const protoPath of protos.map((proto) => path.join(PROTO_PATH, proto))) {
        codegens.push(codegen(protoPath, depsPaths, DIST_PATH));
    }
    await Promise.all(codegens);
}

module.exports = codegenAll;
module.exports.default = codegenAll;
