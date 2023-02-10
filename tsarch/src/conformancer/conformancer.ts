import { Module } from "../ruler/rules";
import { TypeScriptModule } from "../analyzer/typescript_module";
import { string } from "yargs";

export interface Occurrence {
    line?: number
    kind?: string
    name?: string
    originFile?: string
    targetFile?: string
    originModule?: string
    targetModule?: string
}

export interface Report {
    divergencies: Occurrence[]
    convergencies: Occurrence[]
    absences: Occurrence[]
    alerts: Occurrence[]
}

function mapFileToModule(rules: Map<string, Module>): Map<string, string> {
    const fileToModule = new Map<string, string>()
    rules.forEach((rule, name) => rule.files.forEach(file => fileToModule.set(file, name)))
    return fileToModule
}

export function check(symbols: TypeScriptModule[], rules: Map<string, Module>): Report {
    const fileToModule = mapFileToModule(rules)
    let occurrencies: Report = {
        divergencies: [],
        convergencies: [],
        absences: [],
        alerts: []
    }
    symbols.forEach(file => {
        let actualModule = fileToModule.get(file.moduleName)
        if (actualModule === undefined) {
            console.log(`Warning: arquivo ${file.moduleName} não contemplado nas regras`)
            return
        }
        let actualRule = rules.get(actualModule ? actualModule : "")
        if (actualRule === undefined) { // Arquivo não contemplado nas regras
            console.log(`Warning: arquivo ${file.moduleName} não contemplado nas regras`)
            return
        }
        occurrencies = verify(file, actualRule, fileToModule, occurrencies)
    })
    return occurrencies
}

function verify(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    function partial(func: (m: TypeScriptModule, r: Module, f: Map<string, string>, o: Report) => Report): Report {
        return func(module, rule, fileToModule, occurrencies)
    }
    occurrencies = partial(verifyEntity)
    occurrencies = partial(verifyCustomType)
    occurrencies = partial(verifyImportation)
    occurrencies = partial(findAbsences)
    return partial(findAlerts)
}

function verifyEntity(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    module.entities.forEach(entities => entities.forEach(e => {
        e.typeReference.forEach(reference => {
            let occurrence = {
                line: e.line,
                kind: "entity",
                name: e.name,
                originFile: module.moduleName,
                targetFile: reference,
                originModule: fileToModule.get(module.moduleName),
                targetModule: fileToModule.get(reference)
            }
            if (!rule.allowed?.some(file => file === reference)) {
                occurrencies.divergencies.push(occurrence)
            }
            else {
                occurrencies.convergencies.push(occurrence)
            }
        })
    }))
    return occurrencies
}
function verifyCustomType(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    module.types.forEach(customType => customType.forEach(ct => {
        ct.typeReferences.forEach(reference => {
            let occurrence = {
                line: ct.line,
                kind: "type",
                name: ct.name,
                originFile: module.moduleName,
                targetFile: reference,
                originModule: fileToModule.get(module.moduleName),
                targetModule: fileToModule.get(reference)
            }
            if (!rule.allowed?.some(file => file === reference)) {
                occurrencies.divergencies.push(occurrence)
            }
            else {
                occurrencies.divergencies.push(occurrence)
            }
        })
    }))
    return occurrencies
}
function verifyImportation(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    module.importations.forEach(importation => {
        let occurrence = {
            line: importation.line,
            kind: "importation",
            originFile: module.moduleName,
            targetFile: importation.source,
            originModule: fileToModule.get(module.moduleName),
            targetModule: fileToModule.get(importation.source)
        }
        if (!importation.internal) return // Not considers external dependencies
        if (!rule.allowed?.some(file => file === importation.source)) {
            occurrencies.divergencies.push(occurrence)
        }
        else {
            occurrencies.convergencies.push(occurrence)
        }
    })
    return occurrencies
}

function getUsedModulesAndFiles(module: TypeScriptModule, fileToModule: Map<string, string>): string[] {
    let dependedFiles: string[] = []
    module.entities.forEach(entities => entities.forEach(entity => dependedFiles.push(...entity.typeReference)))
    module.types.forEach(customTypes => customTypes.forEach(customType => dependedFiles.push(...customType.typeReferences)))
    module.importations.forEach(importations => dependedFiles.push(importations.source))
    let dependedModules = new Set<string>()
    dependedFiles.forEach(file => {
        let module = fileToModule.get(file)
        if (module) {
            dependedModules.add(module)
        }
    })
    return [...dependedModules, ...dependedFiles]
}

function findAlerts(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    if (!rule.originalAllowed || rule.originalAllowed.length <= 0) {
        return occurrencies
    }
    let allowedModules = rule.originalAllowed
    let satisfiedModules = new Set(getUsedModulesAndFiles(module, fileToModule))

    allowedModules.forEach(allowed => {
        if (allowed !== undefined)
            if (!satisfiedModules.has(allowed)) {
                occurrencies.alerts.push({
                    originModule: fileToModule.get(module.moduleName),
                    targetModule: allowed,
                })
            }
    })

    return occurrencies
}

function findAbsences(module: TypeScriptModule, rule: Module, fileToModule: Map<string, string>, occurrencies: Report): Report {
    if (!rule.required || rule.required.length <= 0) {
        return occurrencies
    }

    let requiredModules = rule.required
    let satisfiedModules = new Set(getUsedModulesAndFiles(module, fileToModule))

    requiredModules.forEach(required => {
        if (required !== undefined)
            if (!satisfiedModules.has(required)) {
                occurrencies.absences.push({
                    targetFile: module.moduleName,
                    originModule: fileToModule.get(module.moduleName),
                    targetModule: required,
                })
            }
    })

    return occurrencies
}
