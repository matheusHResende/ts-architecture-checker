import { readFileSync } from "fs"

import { Component } from "../project/component"
import { Module } from "../project/module"
import { getFiles } from "../utils/file_utils"
import { TsConfig } from "./TsConfig"

export class Project {
    projectPath: string
    codePath: string
    files: string[]

    modules: Array<Module>
    parsed: boolean

    constructor(path: string) {
        this.parsed = false
        this.codePath = path
        this.projectPath = path
        try {
            const tsconfig: TsConfig = JSON.parse(readFileSync(`${path}/tsconfig.json`, "utf-8"))
            if (tsconfig?.compilerOptions?.rootDir !== null && tsconfig?.compilerOptions?.rootDir !== undefined)
                this.codePath = `${path}/${tsconfig.compilerOptions.rootDir}`
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                console.log("Syntax error, please fix your tsconfig.json file\n", e.message)
            }
            else {
                console.log("Missing tsconfig.json file, using input path as basepath for project")
            }
        }
        this.files = getFiles(this.codePath).map(file => file.replace(this.codePath, "")).
            filter(file => !file.endsWith(".d.ts") && file.endsWith(".ts"))

        this.modules = this.files.map(file => new Module(`${this.codePath}${file}`, this.codePath))
    }

    parse() {
        if (!this.parsed) {
            this.modules?.forEach(module => module.parse())
            this.parsed = true
        }
    }

    exportedSymbols(): Array<Component> {
        const exported: Array<Component> = []
        this.modules.forEach(module => exported.push(...module.getExportedComponents()))
        return exported
    }

    getDependencies(): Map<string, string[]> {
        const dependencies = new Map<string, string[]>()
        this.modules.forEach(module => dependencies.set(module.name, module.getDependencies()))
        return dependencies
    }

    getModulesDependencies(): Map<string, string[]> {
        const dependencies = new Map<string, string[]>()
        const modules = new Map<string, Module>()

        this.modules.forEach(module => {
            modules.set(module.name, module)
        })

        this.modules.forEach(module => {
            const d: string[] = []
            module.getDependencies().forEach(dependency => {
                const r = modules.get(dependency)
                if (r == undefined) return
                d.push(r.referedRule)
            })
            dependencies.set(module.referedRule, d)

        })

        dependencies.forEach((value, key, arr) => {
            arr.set(key, [...new Set(value)])
        })

        return dependencies
    }

}