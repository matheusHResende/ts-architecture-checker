import { Archscript } from "./archscript/Archscript"
import "command-line-args"

function main() {
    //const as = new Archscript(".", "./rules.json")
    //as.run()

    const optionsDefinition = [
        { name: 'project', alias: 'p', type: String },
        { name: 'rule', alias: 'r', type: String },
        { name: 'output', alias: 'o', type: String }
    ]
    const commandLineArgs = require("command-line-args")
    const options = commandLineArgs(optionsDefinition)

    const as = new Archscript(options.project, options.rule)
    as.run(options.output)
}

main()