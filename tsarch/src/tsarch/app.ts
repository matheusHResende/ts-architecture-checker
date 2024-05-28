import { parse } from "../analyzer/parser"
import { getFiles } from "../utils/fileSystem"
import { getRules } from "../ruler/rules"
import { check } from "../conformancer/conformancer"
import { Graph } from "../visualizer/graph"
import { Textual } from "../visualizer/textual"
import { DSM } from "../visualizer/dsm"

export function verify(directory: string, rulerFile?: string) {
    const rule = rulerFile ? rulerFile : `${directory}/architectural-rules.json`
    const files = getFiles(directory).filter(file => file.endsWith(".ts"))

    const symbols = parse(files, directory)
    try {
        const rules = getRules(rule, files)
        const report = check(symbols, rules)
        new Graph(report.divergencies, report.convergencies, report.absences, report.alerts).generate("graph.png")
        new Textual(report.divergencies, report.convergencies, report.absences, report.alerts).generate("results.json")
        new DSM(report.divergencies, report.convergencies, report.absences, report.alerts).generate("dsm.png")
    }
    catch (err) {
        console.log(err)
        if (err instanceof Error) {
            console.log((err as Error).message)
        }
    }
}
