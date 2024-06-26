import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { corrigir_csv } from "../leitor/csv"

export function run() {
    yargs(hideBin(process.argv))
        // Use the commands directory to scaffold.
        .commandDir('commands')
        // Enable strict mode.
        .strict()
        // Useful aliases.
        .alias({ h: 'help' })
        .argv;
}
