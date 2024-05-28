import * as fs from "fs"
import { makeAbsolute } from "../utils/fileSystem"
import { sep } from "path"

export interface Module {
    files: string[]
    allowed?: string[]
    forbidden?: string[]
    required?: string[]
    packages?: string[]
    originalAllowed?: string[]
}

export function getRules(rulesPath: string, files: string[]): Map<string, Module> {
    const rules = new Map<string, Module>(Object.entries(JSON.parse(fs.readFileSync(rulesPath, { encoding: 'utf-8' }))))

    isValid(rules)
    return expandRules(rulesPath, rules, files)
}

function expandRule(files: string[], rules?: string[]): string[] {
    if (rules === undefined) return []
    let expandedRules: string[] = rules.filter(rule => !rule.endsWith("*"))
    let strictRule = rules.filter(rule => rule.endsWith(`${sep}*`)).map(rule => rule.replace(`${sep}*`, ""))
    let unstrictRule = rules.filter(rule => rule.endsWith(`${sep}**`)).map(rule => rule.replace(`${sep}**`, ""))
    let f = strictRule.map(rule => findRelated(rule, files, strictlyBelongs))
    f = [...f, ...unstrictRule.map(rule => findRelated(rule, files, belongs))]
    for (let row of f) for (let e of row) expandedRules.push(e)
    return expandedRules
}

function expandModule(rules: Map<string, Module>, escope: string[] | undefined, modules: string[]): string[] {
    if (escope === undefined) return []
    let referedModules: string[] = []
    let module = escope?.filter(statement => !modules.some(s => {
        if (statement === s) {
            referedModules.push(s)
            return true
        }
        return false
    }))
    referedModules.forEach(m => {
        let f = rules.get(m)?.files
        module?.push(...(f ? f : []))
    })

    return module
}

function expandRules(
    rulePath: string, rules: Map<string, Module>, files: string[]
): Map<string, Module> {
    const modules = [...rules.keys()]
    // Normalize paths according rules file path
    rules.forEach(module => {
        if (module.files) {
            module.files = makeAbsolute(rulePath, module.files)
        }
    })
    // Transform generic form into especific file name
    rules.forEach(module => {
        module.files = expandRule(files, module.files)
        module.allowed = expandRule(files, module.allowed)
        module.forbidden = expandRule(files, module.forbidden)
        module.required = expandRule(files, module.required)
        module.originalAllowed = module.allowed
    })
    // Transform module name into files
    rules.forEach(module => {
        module.allowed = expandModule(rules, module.allowed, modules)
        module.forbidden = expandModule(rules, module.forbidden, modules)
    })
    // Transform into allowed
    rules.forEach(module => {
        let reference = new Set(module.forbidden ? module.forbidden : [])
        module.allowed = module.allowed != undefined && module.allowed.length > 0 ?
            module.allowed : files.filter(file => !reference.has(file))
        module.forbidden = undefined
    })
    // Make module itself allowed
    rules.forEach(module => {
        module.allowed = [...new Set([...module.allowed ? module.allowed : [], ...module.files])]
    })

    return rules
}

function findRelated(rule: string, files: string[], belongs: (rule: string, file: string) => boolean): string[] {
    return files.filter(file => belongs(rule, file))
}

function belongs(rule: string, file: string): boolean {
    return file.startsWith(rule)
}

function strictlyBelongs(rule: string, file: string): boolean {
    let sFile = file.split(sep)
    sFile.pop()
    return sFile.join(sep) === rule
}

function isValid(rules: Map<string, Module>) {
    for (const [name, rule] of rules.entries()) {
        if (rule.allowed && rule.forbidden) {
            throw new Error(`Regra ${name} contém regras allowed e forbidden simultaneamente`)
        }
    }
}
