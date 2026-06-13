import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import { verify } from "../../src/tsarch/app"

const fakePaths: any = { dsm: "/tmp/d.png", textual: "/tmp/t.json", graph: "/tmp/g.png" }

it("lança erro quando o arquivo de regras não existe (BUG-4 regressão)", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-app-"))
    fs.writeFileSync(path.join(tmpDir, "a.ts"), "const x = 1")
    try {
        expect(() => verify(tmpDir, fakePaths, "/nonexistent/rules.json")).toThrow()
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    }
})

it("lança erro quando o diretório não existe", () => {
    expect(() => verify("/nonexistent/directory", fakePaths)).toThrow()
})

it("lança erro quando o arquivo de regras contém JSON inválido", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-app-"))
    try {
        fs.writeFileSync(path.join(tmpDir, "a.ts"), "const x = 1")
        const rulesFile = path.join(tmpDir, "rules.json")
        fs.writeFileSync(rulesFile, "{ invalid json")
        expect(() => verify(tmpDir, fakePaths, rulesFile)).toThrow()
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    }
})
