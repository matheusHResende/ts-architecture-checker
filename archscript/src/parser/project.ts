import { getFiles } from "../utils/file_utils";
import { Component } from "./component";
import { Module } from "./module";

class Project {
    modules: Array<Module>
    parsed: boolean

    constructor(rootDirectory: string) {
        this.modules = getFiles(rootDirectory).filter(file => {
            return !file.endsWith(".d.ts") && file.endsWith(".ts")
        }).map(file => 
                new Module(file, rootDirectory))
        this.parsed = false
    }

    parse() {
        if (!this.parsed) {
            this.modules.forEach(module => module.parse())
            this.parsed = true
        }
    }

    
    exportedSymbols(): Array<Component> {
        const exported: Array<Component> = []
        this.modules.forEach(module => exported.push(...module.getExportedComponents()))
        return exported
    }
}

export { Project }