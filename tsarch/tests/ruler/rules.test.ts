import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import { getRules } from "../../src/ruler/rules"

function setupFixture(tmpDir: string, rulesJson: object, fileNames: string[]) {
    fileNames.forEach(f => {
        const full = path.join(tmpDir, f)
        fs.mkdirSync(path.dirname(full), { recursive: true })
        fs.writeFileSync(full, "")
    })
    const rulesFile = path.join(tmpDir, "rules.json")
    fs.writeFileSync(rulesFile, JSON.stringify(rulesJson))
    return {
        rulesFile,
        files: fileNames.map(f => path.resolve(tmpDir, f))
    }
}

describe("getRules — BUG-7 e comportamentos fundamentais", () => {
    let tmpDir: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-rules-test-"))
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it("BUG-7: allowed com glob que expande para [] mantém módulo restritivo", () => {
        const fileNames = ["src/domain/a.ts", "src/infra/b.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            domain: {
                files: ["src/domain/*"],
                allowed: ["nonexistent/*"]
            }
        }, fileNames)

        const rules = getRules(rulesFile, files)
        const domain = rules.get("domain")!

        const infraFile = path.resolve(tmpDir, "src/infra/b.ts")
        expect(domain.allowed).not.toContain(infraFile)
    })

    it("módulo sem allowed nem forbidden pode referenciar qualquer arquivo", () => {
        const fileNames = ["src/a.ts", "src/b.ts", "src/c.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            everything: { files: ["src/a.ts"] }
        }, fileNames)

        const rules = getRules(rulesFile, files)
        const mod = rules.get("everything")!

        expect(mod.allowed).toHaveLength(files.length)
        files.forEach(f => expect(mod.allowed).toContain(f))
    })

    it("forbidden converte corretamente — allowed = todos exceto forbidden", () => {
        const fileNames = ["src/a.ts", "src/b.ts", "src/c.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            modA: { files: ["src/a.ts"], forbidden: ["src/b.ts"] }
        }, fileNames)

        const rules = getRules(rulesFile, files)
        const modA = rules.get("modA")!

        const bFile = path.resolve(tmpDir, "src/b.ts")
        const aFile = path.resolve(tmpDir, "src/a.ts")
        const cFile = path.resolve(tmpDir, "src/c.ts")

        expect(modA.allowed).not.toContain(bFile)
        expect(modA.allowed).toContain(aFile)
        expect(modA.allowed).toContain(cFile)
    })

    it("isValid lança quando allowed e forbidden coexistem", () => {
        const fileNames = ["src/a.ts", "src/b.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            conflict: {
                files: ["src/a.ts"],
                allowed: ["src/b.ts"],
                forbidden: ["src/b.ts"]
            }
        }, fileNames)

        expect(() => getRules(rulesFile, files)).toThrow(Error)
    })

    it("glob /* expande apenas para arquivos diretamente no diretório (não recursivo)", () => {
        const fileNames = ["src/a.ts", "src/sub/b.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            modA: { files: ["src/a.ts"], allowed: ["src/*"] }
        }, fileNames)

        const rules = getRules(rulesFile, files)
        const modA = rules.get("modA")!

        const aFile = path.resolve(tmpDir, "src/a.ts")
        const bFile = path.resolve(tmpDir, "src/sub/b.ts")

        expect(modA.allowed).toContain(aFile)
        expect(modA.allowed).not.toContain(bFile)
    })

    it("glob /** expande recursivamente", () => {
        const fileNames = ["src/a.ts", "src/sub/b.ts"]
        const { rulesFile, files } = setupFixture(tmpDir, {
            modA: { files: ["src/a.ts"], allowed: ["src/**"] }
        }, fileNames)

        const rules = getRules(rulesFile, files)
        const modA = rules.get("modA")!

        const aFile = path.resolve(tmpDir, "src/a.ts")
        const bFile = path.resolve(tmpDir, "src/sub/b.ts")

        expect(modA.allowed).toContain(aFile)
        expect(modA.allowed).toContain(bFile)
    })
})
