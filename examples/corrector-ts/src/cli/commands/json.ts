import { Arguments, CommandBuilder } from "yargs";
import { Prova } from "../../models/prova"

interface Options {
    prova: string
    gabarito: string
    turma: string | undefined
}

export const command: string = 'json <prova> <gabarito>';
export const desc: string = 'Corrige a prova com base no gabarito';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            turma: { type: 'string' }
        })
        .positional('prova', { type: 'string', demandOption: true })
        .positional('gabarito', { type: 'string', demandOption: true })

export const handler = (argv: Arguments<Options>): void => {
    const { prova, gabarito, turma } = argv;
    console.log(prova, gabarito, turma)
}
