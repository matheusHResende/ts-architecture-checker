import { readFileSync } from "fs";
import { Project } from "../parser/project";
import { Module } from "./module";
import { Module as TSModule } from "../parser/module" 

export class Ruler {
    ruleSet: Module[]
    project: Project

    projectModules: Map<string, TSModule>
    ruleModules: Map<string, Module>

    constructor(ruleFile: string, project: Project) {
        this.ruleSet = JSON.parse(readFileSync(ruleFile, {encoding: 'utf-8'})).
            map((module: Module) => Object.assign(new Module(module.name, module.files), module))
        this.project = project
        this.project.parse()
        this.projectModules = new Map<string, TSModule>()
        this.setProjectModules()
        this.expandRules()
        this.matchModules()

        this.ruleModules = new Map<string, Module>()
        this.ruleSet.forEach(module => this.ruleModules.set(module.name, module))
    }

    getDrifts() {
        this.projectModules.forEach(tsModule => {
            tsModule.referedRules.forEach(referedRule => {
                const rule = this.ruleModules.get(referedRule)
                if(rule === undefined) return
                const dependencies = tsModule.getDependencies()
                // everything is allowed
                for (const dependency of dependencies) {
                    if (!rule.allowed?.some(allowed => allowed === dependency)){
                        console.log(`${dependency} is not allowed for ${tsModule.name}`)
                    }
                }
                // none is forbidden
                for (const dependency of dependencies) {
                    if (rule.forbidden?.some(forbidden => forbidden === dependency)){
                        console.log(`${dependency} is forbidden for ${tsModule.name}`)
                    }
                }
                // everything required is done
                if(rule.required === undefined) return
                for (const required of rule.required) {
                    if (!dependencies.some(dependency => dependency === required)) {
                        console.log(`${required} is required in ${tsModule.name}`)
                    }
                }

                //[dataAccess:required:HasId] EntityStore does not depend on HasId.
            })
        }) 
    }

    matchModules() {
        this.ruleSet.forEach(module => module.files.forEach(file => {
            const tsModule = this.projectModules.get(file)
            tsModule?.referedRules.push(module.name)
        }))
    }

    setProjectModules(){
        this.project.modules.forEach(module => this.projectModules.set(module.name, module))
    }

    expandRules() {
        const expandableNames = new Set<string>()
        this.ruleSet.forEach(module => {
            // module.expandRules(projectModules)
            module.getExpandableNames().forEach(name => expandableNames.add(name))
        })

        const nameCache = new Map<string, string[]>()
        
        expandableNames.forEach(name => {
            if(name.endsWith("**")){
                nameCache.set(name, this.findRelated(name.replaceAll('*', '')))
            }
            else if(name.endsWith("*")){
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
            if(projectModule.package === file){
                related.push(projectModule.name)
                // related.push(...projectModule.getExportedComponents().map(component => component.globalIdentifier))
            }
        })
        return related
    }
    
    findRelated(file: string): string[] {
        const related: string[] = []
        this.project.modules.forEach(projectModule => {
            if(projectModule.name.startsWith(file)){
                related.push(projectModule.name)
                // related.push(...projectModule.getExportedComponents().map(component => component.globalIdentifier))
            }
        })
        return related
    }
}