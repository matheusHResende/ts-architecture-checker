import { Parser } from "../parser/parser"
import { Component } from "./component"
import { Importation } from "./importation"
import { parse } from '../parser/ParserN'


export class Module {
    name: string
    package: string
    filePath: string
    symbols: Component[]
    importations: Importation[]

    referedRule: string

    constructor(filePath: string, basePath: string) {
        this.filePath = filePath
        this.symbols = []
        this.importations = []
        this.name = filePath.replace(basePath, "").replace(".ts", "").replace(".d", "")
        const splitedPath = this.name.split('/').slice(0, -1)
        splitedPath.push("")
        this.package = splitedPath.join('/')

        this.referedRule = ""
    }

    parse(): void {
        //let [symbols, importations] = new Parser(this.filePath).run(this.name)
        // this.symbols = symbols
        // this.importations = importations

        parse(this.filePath)
    }

    getDependencies(): string[] {
        return this.importations.filter(importation => importation.internalDependency).map(importation => importation.absolutePath)
    }

    getExportedComponents(): Array<Component> {
        return this.symbols.filter(component => component.exported)
    }
}