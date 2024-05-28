import { Arguments, CommandBuilder } from "yargs";
import { verify, ArtifactPaths } from "../../tsarch/app"
import path from "path";
interface Options {
    directory: string
    rules: string | undefined
}

export const command: string = 'conformance <directory>';
export const desc: string = 'Verifica a conformidade da arquitetura do projeto em questão';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .option('rules', { type: 'string', alias: 'r' })
        .option('artifactsPath', { type: 'string', alias: 'p' })
        .option('dsmPath', { type: 'string', alias: 'dsm', default: 'dsm.png' })
        .option('graphPath', { type: 'string', alias: 'graph', default: 'graph.png' })
        .option('textualPath', { type: 'string', alias: 'text', default: 'textual.json' })
        .positional('directory', { type: 'string', demandOption: true })

export const handler = (argv: Arguments<Options>): void => {
    const { directory, rules, artifactsPath, dsmPath, textualPath, graphPath } = argv
    let paths: ArtifactPaths = {
        dsm: path.join(`${artifactsPath}`, `${dsmPath}`),
        textual: path.join(`${artifactsPath}`, `${textualPath}`),
        graph: path.join(`${artifactsPath}`, `${graphPath}`),
    }

    verify(directory, paths, rules)
}
