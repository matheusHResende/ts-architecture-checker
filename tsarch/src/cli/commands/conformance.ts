import { Arguments, CommandBuilder } from "yargs";
import { verify } from "../../tsarch/app"
interface Options {
    directory: string
    rules: string | undefined
}

export const command: string = 'conformance <directory>';
export const desc: string = 'Verifica a conformidade da arquitetura do projeto em questão';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            rules: { type: 'string' }
        })
        .positional('directory', { type: 'string', demandOption: true })

export const handler = (argv: Arguments<Options>): void => {
    const { directory, rules } = argv
    verify(directory, rules)
}
