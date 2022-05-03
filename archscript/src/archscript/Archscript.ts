// import { Project } from "../project/project";
import { Ruler } from "../ruler/ruler";
import { GraphRepresentation } from "../visualizer/GraphRepresentation";
import { Project } from "../project/project"
// import { Rules } from "./Rules";

import { parse } from "../parser/ParserN"

export class Archscript {
    project: Project
    rules: Ruler

    constructor(path: string, rulePath: string) {
        // this.project = new Project(path)
        // this.rules = new Rules(rulePath)
        this.project = new Project(path)
        this.rules = new Ruler(rulePath, this.project)
    }

    run(output: string = "output.png"): void {
        // this.project.files.forEach(file =>
        //     new Parser(`${this.project.codePath}/${file}`)
        //         .run(file.replace(".ts", "")))
        const codePath = this.project.codePath
        // this.project.files.forEach(file => parse(`${codePath}${file}`))

        const drifts = this.rules.getDrifts()
        drifts.forEach(drift => console.log(`${drift}`))
        const dependencies = this.project.getModulesDependencies()
        new GraphRepresentation(dependencies, drifts.map(drift => [drift.module, drift.targetModule])).render(output)
    }

    runExtended(output: string = "output.png"): void {
        const drifts = this.rules.getDrifts()
        drifts.forEach(drift => console.log(`${drift}`))
        const dependencies = this.project.getDependencies()
        new GraphRepresentation(dependencies, drifts.map(drift => [drift.file, drift.targetFile])).render(output)
    }
}
