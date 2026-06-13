import { check } from "../../src/conformancer/conformancer"
import { TypeScriptModule } from "../../src/analyzer/typescript_module"
import { Importation } from "../../src/analyzer/importation"
import { CustomType } from "../../src/analyzer/custom_type"
import { Module } from "../../src/ruler/rules"

function makeModule(name: string): TypeScriptModule {
    return new TypeScriptModule(name)
}

function makeRules(config: Record<string, Partial<Module>>): Map<string, Module> {
    const rules = new Map<string, Module>()
    for (const [name, conf] of Object.entries(config)) {
        rules.set(name, {
            files: conf.files ?? [],
            allowed: conf.allowed,
            required: conf.required,
            originalAllowed: conf.originalAllowed,
            ...conf
        })
    }
    return rules
}

describe("verifyCustomType", () => {
    it("BUG-1 regressão: referência permitida vai para convergencies, não divergencies", () => {
        const moduleA = makeModule("/project/a.ts")
        const myService = new CustomType("MyService", 1, "/project/a.ts", ["BaseService"])
        const baseService = new CustomType("BaseService", 1, "/project/b.ts")
        const typesMap = new Map<string, CustomType[]>()
        typesMap.set("BaseService", [baseService])
        myService.setFileReferences(typesMap)
        moduleA.addCustomType(myService)

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: ["/project/b.ts"], originalAllowed: ["/project/b.ts"] }
        })

        const report = check([moduleA], rules)

        expect(report.convergencies.length).toBeGreaterThan(0)
        expect(report.divergencies.length).toBe(0)
    })

    it("referência NÃO permitida vai para divergencies", () => {
        const moduleA = makeModule("/project/a.ts")
        const myService = new CustomType("MyService", 1, "/project/a.ts", ["BaseService"])
        const baseService = new CustomType("BaseService", 1, "/project/b.ts")
        const typesMap = new Map<string, CustomType[]>()
        typesMap.set("BaseService", [baseService])
        myService.setFileReferences(typesMap)
        moduleA.addCustomType(myService)

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: [], originalAllowed: [] }
        })

        const report = check([moduleA], rules)

        expect(report.divergencies.length).toBeGreaterThan(0)
        expect(report.convergencies.length).toBe(0)
    })
})

describe("verifyImportation", () => {
    it("import interno não-permitido vai para divergencies", () => {
        const moduleA = makeModule("/project/a.ts")
        moduleA.addImportation(new Importation("SomeClass", "/project/b.ts", 5, true))

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: [], originalAllowed: [] }
        })

        const report = check([moduleA], rules)
        expect(report.divergencies.length).toBeGreaterThan(0)
    })

    it("import interno permitido vai para convergencies", () => {
        const moduleA = makeModule("/project/a.ts")
        moduleA.addImportation(new Importation("SomeClass", "/project/b.ts", 5, true))

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: ["/project/b.ts"], originalAllowed: ["/project/b.ts"] }
        })

        const report = check([moduleA], rules)
        expect(report.convergencies.length).toBeGreaterThan(0)
        expect(report.divergencies.length).toBe(0)
    })

    it("import externo (internal: false) é ignorado", () => {
        const moduleA = makeModule("/project/a.ts")
        moduleA.addImportation(new Importation("map", "lodash", 2, false))

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: [], originalAllowed: [] }
        })

        const report = check([moduleA], rules)
        expect(report.divergencies.length).toBe(0)
        expect(report.convergencies.length).toBe(0)
    })
})

describe("findAbsences", () => {
    it("módulo obrigatório não usado gera ausência", () => {
        const moduleA = makeModule("/project/a.ts")

        const rules = makeRules({
            moduleA: {
                files: ["/project/a.ts"],
                allowed: ["/project/required.ts"],
                required: ["/project/required.ts"],
                originalAllowed: ["/project/required.ts"]
            }
        })

        const report = check([moduleA], rules)
        expect(report.absences.length).toBeGreaterThan(0)
    })

    it("sem required não gera ausências", () => {
        const moduleA = makeModule("/project/a.ts")

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: ["/project/b.ts"], originalAllowed: ["/project/b.ts"] }
        })

        const report = check([moduleA], rules)
        expect(report.absences.length).toBe(0)
    })
})

describe("check()", () => {
    it("arquivo sem regra correspondente é ignorado sem crash", () => {
        const moduleUnlisted = makeModule("/unlisted/file.ts")

        const rules = makeRules({
            moduleA: { files: ["/project/a.ts"], allowed: ["/project/b.ts"], originalAllowed: ["/project/b.ts"] }
        })

        expect(() => check([moduleUnlisted], rules)).not.toThrow()
        const report = check([moduleUnlisted], rules)
        expect(report.divergencies.length).toBe(0)
        expect(report.convergencies.length).toBe(0)
        expect(report.absences.length).toBe(0)
    })
})
