import { readFileSync } from "fs";
import { Project } from "../project/project";
import { Module } from "./module";
import { Drift } from "./drift"
import { Module as TSModule } from "../project/module"

export class Ruler {
    ruleSet: Module[]
    project: Project

    projectModules: Map<string, TSModule>
    ruleModules: Map<string, Module>

    constructor(ruleFile: string, project: Project) {
        this.ruleSet = JSON.parse(readFileSync(ruleFile, { encoding: 'utf-8' })).
            map((module: Module) => Object.assign(new Module(module.name, module.files), module))

        this.project = project
        this.project.parse()
        this.projectModules = new Map<string, TSModule>()
        this.setProjectModules()
        this.expandRules()
        this.matchModules()
        this.simplify()
        this.ruleModules = new Map<string, Module>()
        this.ruleSet.forEach(module => this.ruleModules.set(module.name, module))
    }

    simplify() {
        const available = this.project.modules.map(module => module.name)
        this.ruleSet.forEach(rule => rule.simplify(available))
    }

    getDrifts(): Drift[] {
        const drifts: Drift[] = []
        this.projectModules.forEach(tsModule => {
            const rule = this.ruleModules.get(tsModule.referedRule)
            if (rule === undefined) return
            const dependencies = tsModule.getDependencies()
            // everything is allowed
            for (const dependency of dependencies) {
                if (rule.files.some(file => dependency === file)) continue
                if (!rule.allowed?.some(allowed => allowed === dependency)) {
                    const dependencyModule = this.projectModules.get(dependency)?.referedRule
                    if (dependencyModule != undefined)
                        drifts.push(
                            new Drift(
                                "allowed",
                                tsModule.referedRule,
                                tsModule.name,
                                dependency,
                                dependencyModule
                            )
                        )
                }
            }
            // everything required is done
            if (rule.required === undefined) return
            for (const required of rule.required) {
                if (!dependencies.some(dependency => dependency === required)) {
                    const requiredModule = this.projectModules.get(required)?.referedRule
                    if (requiredModule != undefined)
                        drifts.push(
                            new Drift(
                                "required",
                                tsModule.referedRule,
                                tsModule.name,
                                required,
                                requiredModule
                            )
                        )
                }
            }

        })
        return drifts
    }

    matchModules() {
        this.ruleSet.forEach(module => module.files.forEach(file => {
            const tsModule = this.projectModules.get(file)
            if (tsModule == undefined) return
            tsModule.referedRule = module.name
        }))
    }

    setProjectModules() {
        this.project.modules.forEach(module => this.projectModules.set(module.name, module))
    }

    expandRules() {
        const expandableNames = new Set<string>()
        this.ruleSet.forEach(module => {
            module.getExpandableNames().forEach(name => expandableNames.add(name))
        })
        const nameCache = new Map<string, string[]>()

        expandableNames.forEach(name => {
            if (name.endsWith("**")) {
                nameCache.set(name, this.findRelated(name.replaceAll('*', '')))
            }
            else if (name.endsWith("*")) {
                nameCache.set(name, this.findStrictRelated(name.replaceAll('*', '')))
            }
        })
        this.ruleSet.forEach(module => module.expandRules(nameCache))

        const modulesFiles = new Map<string, string[]>()
        this.ruleSet.forEach(module => modulesFiles.set(module.name, module.files))
        this.ruleSet.forEach(module => module.setModuleReference(modulesFiles))
        this.ruleSet.forEach(module => module.clean())
    }

    isValid(): boolean {
        const modules = this.ruleSet.map(module => module.name)
        for (const module of this.ruleSet) {
            if (!module.isValid(modules)) {
                return false
            }
        }
        return true
    }

    findStrictRelated(file: string): string[] {
        const related: string[] = []
        this.project.modules.forEach(projectModule => {
            if (projectModule.package === file) {
                related.push(projectModule.name)
                // related.push(...projectModule.getExportedComponents().map(component => component.globalIdentifier))
            }
        })
        return related
    }

    findRelated(file: string): string[] {
        const related: string[] = []
        this.project.modules.forEach(projectModule => {
            if (projectModule.name.startsWith(file)) {
                related.push(projectModule.name)
                // related.push(...projectModule.getExportedComponents().map(component => component.globalIdentifier))
            }
        })
        return related
    }
}