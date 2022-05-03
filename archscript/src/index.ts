import { Archscript } from "./archscript/Archscript"
import "command-line-args"

function main() {
    const optionsDefinition = [
        { name: 'project', alias: 'p', type: String },
        { name: 'rule', alias: 'r', type: String },
        { name: 'output', alias: 'o', type: String },
        { name: 'extended', alias: 'e', type: Boolean, default: false }
    ]
    const commandLineArgs = require("command-line-args")
    const options = commandLineArgs(optionsDefinition)

    const as = new Archscript(options.project, options.rule)
    if (!options.extended)
        as.run(options.output)
    else
        as.runExtended(options.output)
}

main()