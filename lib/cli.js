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
                    console.log(stdout);
                    res(stdout);
                } else {
                    console.error(error);
                    console.error(stderr);
                    rej(error);
                }
            }
        )
    );
}

async function codegen(protoPath, depsPaths, outputPath) {
    const name = path.parse(protoPath).name;
    const namedPath = path.join(outputPath, name);
    fs.mkdirSync(namedPath, { recursive: true });
    await execWithLog(
        `thrift -r -gen js:node -o ${namedPath} ${depsPaths
            .map((dep) => `-I ${dep}`)
            .join(' ')} ${protoPath}`
    );
    const protos = fs
        .readdirSync(path.join(namedPath, 'gen-nodejs'))
        .map((file) => file.split('_types.js'))
        .filter((parts) => parts[1] === '')
        .map(([name]) => name);
    fs.writeFileSync(
        path.join(namedPath, 'context.js'),
        `module.exports = {${protos
            .map((proto) => `${proto}: require('./gen-nodejs/${proto}_types.js')`)
            .join(',')}}`
    );
}

async function genModel(paths, outputPath) {
    await execWithLog(`thrift-ts ${paths.join(' ')} -o ${outputPath} -d false`);
}

async function genMetadata(paths, outputPath) {
    await execWithLog(
        `thrift-ts ${paths.join(' ')} -o ${path.join(outputPath, 'metadata.json')} --json`
    );
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

    const codegens = [];
    for (const protoPath of protos.map((proto) => path.join(PROTO_PATH, proto))) {
        codegens.push(codegen(protoPath, depsPaths, DIST_PATH));
    }
    await Promise.all([
        ...codegens,
        genModel([PROTO_PATH, ...depsPaths], DIST_PATH),
        genMetadata([PROTO_PATH, ...depsPaths], DIST_PATH),
    ]);
    await execWithLog(
        `tsc ${path.join(
            DIST_PATH,
            '*.ts'
        )} --skipLibCheck --target es2015 --lib es2021 --moduleResolution node --declaration`
    );
}

module.exports = codegenAll;
module.exports.default = codegenAll;
