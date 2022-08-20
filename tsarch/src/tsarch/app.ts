import { parse } from "../analyzer/parser"
import { getFiles } from "../utils/fileSystem"
import { getRules } from "../ruler/rules"
import { check } from "../conformancer/conformancer"

export function verify(directory: string, rulerFile?: string) {
    const rule = rulerFile ? rulerFile : `${directory}/architectural-rules.json`
    const files = getFiles(directory).filter(file => file.endsWith(".ts"))

    const symbols = parse(files, directory)
    try {
        const rules = getRules(rule, files)
        check(symbols, rules)
    }
    catch (err) {
        if (err instanceof Error) {
            console.log((err as Error).message)
        }
    }
}
