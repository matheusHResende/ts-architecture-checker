import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import { parse } from "../../src/analyzer/parser"

let tmpDir: string
let filesToClean: string[] = []

beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-parser-"))
    filesToClean = []
})

afterEach(() => {
    filesToClean.forEach(f => { try { fs.unlinkSync(f) } catch (_) {} })
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch (_) {}
})

function writeTmp(filename: string, content: string): string {
    const fullPath = path.join(tmpDir, filename)
    fs.writeFileSync(fullPath, content, "utf-8")
    filesToClean.push(fullPath)
    return fullPath
}

describe("BUG-3 — import renaming", () => {
    it("registra apenas o alias para import renomeado (import { readFile as rf })", () => {
        const otherFile = writeTmp("other.ts", "export const readFile = () => {}")
        const fixtureFile = writeTmp("fixture.ts", "import { readFile as rf } from './other'")

        const symbols = parse([fixtureFile, otherFile], tmpDir)
        const mod = symbols.find(m => m.moduleName === fixtureFile)!

        expect(mod).toBeDefined()
        expect(mod.importations.has("rf")).toBe(true)
        expect(mod.importations.has("readFile")).toBe(false)
    })

    it("registra o nome para import simples sem rename (import { foo })", () => {
        const otherFile = writeTmp("other.ts", "export const foo = 1")
        const fixtureFile = writeTmp("fixture.ts", "import { foo } from './other'")

        const symbols = parse([fixtureFile, otherFile], tmpDir)
        const mod = symbols.find(m => m.moduleName === fixtureFile)!

        expect(mod).toBeDefined()
        expect(mod.importations.has("foo")).toBe(true)
    })

    it("registra o nome local para import default (import defaultFoo from './other')", () => {
        const otherFile = writeTmp("other.ts", "export default function defaultFoo() {}")
        const fixtureFile = writeTmp("fixture.ts", "import defaultFoo from './other'")

        const symbols = parse([fixtureFile, otherFile], tmpDir)
        const mod = symbols.find(m => m.moduleName === fixtureFile)!

        expect(mod).toBeDefined()
        expect(mod.importations.has("defaultFoo")).toBe(true)
    })

    it("registra o alias correto para namespace import (import * as utils)", () => {
        const otherFile = writeTmp("other.ts", "export const x = 1")
        const fixtureFile = writeTmp("fixture.ts", "import * as utils from './other'")

        const symbols = parse([fixtureFile, otherFile], tmpDir)
        const mod = symbols.find(m => m.moduleName === fixtureFile)!

        expect(mod).toBeDefined()
        expect(mod.importations.has("utils")).toBe(true)
        const keys = Array.from(mod.importations.keys())
        expect(keys.some(k => k.startsWith("* "))).toBe(false)
        expect(keys.some(k => k.startsWith(" "))).toBe(false)
    })
})

describe("BUG-5 — funções sobrecarregadas não causam crash", () => {
    it("não lança TypeError ao parsear arquivo com funções sobrecarregadas", () => {
        const fixtureFile = writeTmp("overloaded.ts", `
function foo(x: number): void;
function foo(x: string): void;
function foo(x: any): void {}
`)
        expect(() => {
            const symbols = parse([fixtureFile], tmpDir)
            expect(symbols.length).toBeGreaterThan(0)
        }).not.toThrow()
    })
})

describe("BUG-2 — tsconfig lido corretamente", () => {
    it("parse() não lança erro mesmo sem tsconfig.json no diretório", () => {
        const fixtureFile = writeTmp("simple.ts", "const x = 1")
        expect(() => parse([fixtureFile], tmpDir)).not.toThrow()
    })
})
