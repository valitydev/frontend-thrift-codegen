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
    await execWithLog(`npx thrift-ts ${protoPath} -o ${outputPath} -d false`);
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
            `npx thrift-ts ${protoPath} -o ${path.join(
                namedPath,
                'metadata.json'
            )} --json --pack --prettify`
        );
    }
}

function isThriftFile(file) {
    return path.parse(file).ext === '.thrift';
}

function isDirectory(filePath) {
    try {
        return fs.lstatSync(filePath).isDirectory();
    } catch (err) {
        return false;
    }
}

async function codegenAll() {
    const argv = yargs.command('gen').option('dist', {
        alias: 'd',
        type: 'string',
        description: 'Dist directory',
        default: './lib',
    }).argv;

    const PROTO_DIR = argv._[0] || './proto';
    const DEPS_DIRS = ['./node_modules', './node_modules/@vality'];
    const PROJECT_PATH = process.cwd();
    const DEPS_PROTO_DIR = 'proto';
    const DIST_DIR = argv.dist;

    const PROTO_PATH = path.join(PROJECT_PATH, PROTO_DIR);
    const DIST_PATH = path.join(PROJECT_PATH, DIST_DIR);

    const depsPaths = DEPS_DIRS.map((depsDir) =>
        fs
            .readdirSync(path.join(PROJECT_PATH, depsDir))
            .map((dep) => path.join(PROJECT_PATH, depsDir, dep))
    )
        .flat()
        .filter((depPath) => isDirectory(path.join(depPath, DEPS_PROTO_DIR)));

    const protos = fs.readdirSync(PROTO_PATH).filter((proto) => isThriftFile(proto));

    const depsCodegens = [];
    for (const depPath of depsPaths) {
        const depsProtos = fs
            .readdirSync(path.join(depPath, DEPS_PROTO_DIR))
            .filter((proto) => isThriftFile(proto));
        const protosPaths = depsProtos.map((proto) => path.join(depPath, DEPS_PROTO_DIR, proto));
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
