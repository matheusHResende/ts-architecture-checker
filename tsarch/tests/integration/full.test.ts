import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import { parse } from "../../src/analyzer/parser"
import { getRules } from "../../src/ruler/rules"
import { check } from "../../src/conformancer/conformancer"

/**
 * Fixture layout
 *
 *  src/
 *    domain/entity.ts   — standalone; allowed: []   (nothing external)
 *    infra/service.ts   — imports domain; allowed: [domain/*]
 *    ui/view.ts         — imports infra; allowed: [domain/*]  ← divergence
 */

function writeFile(dir: string, rel: string, content: string): string {
    const full = path.join(dir, rel)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
    return full
}

describe("integração completa: parse → getRules → check", () => {
    let tmpDir: string
    let entityFile: string
    let serviceFile: string
    let viewFile: string
    let rulesFile: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-integration-"))

        entityFile  = writeFile(tmpDir, "src/domain/entity.ts",  "export class Entity {}")
        serviceFile = writeFile(tmpDir, "src/infra/service.ts",
            'import { Entity } from "../domain/entity"\nexport class Service { e: Entity }')
        viewFile    = writeFile(tmpDir, "src/ui/view.ts",
            'import { Service } from "../infra/service"\nexport class View { s: Service }')

        rulesFile = path.join(tmpDir, "rules.json")
        fs.writeFileSync(rulesFile, JSON.stringify({
            domain: { files: ["src/domain/*"], allowed: [] },
            infra:  { files: ["src/infra/*"],  allowed: ["src/domain/*"] },
            ui:     { files: ["src/ui/*"],     allowed: ["src/domain/*"] }
        }))
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it("importação válida gera convergence e não gera divergence", () => {
        const files = [entityFile, serviceFile, viewFile]
        const symbols = parse(files, tmpDir)
        const rules   = getRules(rulesFile, files)
        const report  = check(symbols, rules)

        // service → domain: convergence
        const conv = report.convergencies.find(
            o => o.originFile === serviceFile && o.targetFile === entityFile
        )
        expect(conv).toBeDefined()

        // service não deve gerar divergence relacionada ao domain
        const divService = report.divergencies.filter(o => o.originFile === serviceFile)
        expect(divService).toHaveLength(0)
    })

    it("importação inválida (ui → infra) gera divergence", () => {
        const files = [entityFile, serviceFile, viewFile]
        const symbols = parse(files, tmpDir)
        const rules   = getRules(rulesFile, files)
        const report  = check(symbols, rules)

        // ui → infra: divergence (ui só pode usar domain)
        const div = report.divergencies.find(
            o => o.originFile === viewFile && o.targetFile === serviceFile
        )
        expect(div).toBeDefined()
        expect(div?.originModule).toBe("ui")
        expect(div?.targetModule).toBe("infra")
    })

    it("módulo domain não gera divergences (sem dependências externas)", () => {
        const files = [entityFile, serviceFile, viewFile]
        const symbols = parse(files, tmpDir)
        const rules   = getRules(rulesFile, files)
        const report  = check(symbols, rules)

        const divDomain = report.divergencies.filter(o => o.originFile === entityFile)
        expect(divDomain).toHaveLength(0)
    })

    it("report total: pelo menos 1 divergence e 1 convergence", () => {
        const files = [entityFile, serviceFile, viewFile]
        const symbols = parse(files, tmpDir)
        const rules   = getRules(rulesFile, files)
        const report  = check(symbols, rules)

        expect(report.divergencies.length).toBeGreaterThanOrEqual(1)
        expect(report.convergencies.length).toBeGreaterThanOrEqual(1)
    })
})
