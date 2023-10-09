const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function execWithLog(cmd, cwd = process.cwd()) {
    console.log(`> ${cmd}`);
    return await new Promise((res, rej) =>
        exec(
            cmd,
            {
                cwd,
            },
            (error, stdout, stderr) => {
                console.log(stdout);
                if (error === null) {
                    res(stdout);
                } else {
                    console.error(error);
                    console.error(stderr);
                    rej(error);
                }
            },
        ),
    );
}

async function codegen(protoPath, depsPaths, outputPath) {
    const name = path.parse(protoPath).name;
    const namedPath = path.join(outputPath, name);
    fs.mkdirSync(namedPath, { recursive: true });
    await execWithLog(
        `thrift -r -gen js:node -o ${namedPath} ${depsPaths
            .map((dep) => `-I ${dep}`)
            .join(' ')} ${protoPath}`,
    );
    const protos = fs
        .readdirSync(path.join(namedPath, 'gen-nodejs'))
        .map((file) => file.split('_types.js'))
        .filter((parts) => parts[1] === '')
        .map(([name]) => name);
    fs.writeFileSync(
        path.join(namedPath, 'context.ts'),
        `
        ${protos
            .map((proto) => `import * as ${proto} from './gen-nodejs/${proto}_types.js';`)
            .join('\n')}

        export default {${protos.join(',')}}
        `,
    );
}

async function genModel(paths, outputPath) {
    await execWithLog(`thrift-ts ${paths.join(' ')} -o ${outputPath} -d false --int64AsNumber`);
}

async function genMetadata(paths, outputPath) {
    await execWithLog(
        `thrift-ts ${paths.join(' ')} -o ${path.join(outputPath, 'metadata.json')} --json`,
    );
}

function isThriftFile(file) {
    return path.parse(file).ext === '.thrift';
}

async function compileProto(protoPaths, resultDist) {
    const PROJECT_PATH = process.cwd();
    const PROTO_PATH = path.join(PROJECT_PATH, protoPaths[0]);
    const DEPS_PATHS = protoPaths.slice(1).map((d) => path.join(PROJECT_PATH, d));
    const DIST_PATH = path.join(PROJECT_PATH, resultDist);
    const PROTOS_FILES = fs.readdirSync(PROTO_PATH).filter((proto) => isThriftFile(proto));
    const codegens = [];
    for (const protoPath of PROTOS_FILES.map((proto) => path.join(PROTO_PATH, proto))) {
        codegens.push(codegen(protoPath, DEPS_PATHS, DIST_PATH));
    }
    await Promise.all([
        ...codegens,
        genModel([PROTO_PATH, ...DEPS_PATHS], DIST_PATH),
        genMetadata([PROTO_PATH, ...DEPS_PATHS], DIST_PATH),
    ]);
    await execWithLog(
        `tsc ${path.join(DIST_PATH, '**/*.ts')} ${path.join(
            DIST_PATH,
            '*.ts',
        )} --skipLibCheck --target es2015 --lib es2021 --moduleResolution node --declaration`,
    );
}

module.exports = compileProto;
