import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import { getFiles, makeAbsolute } from "../../src/utils/fileSystem"

describe("getFiles", () => {
    let tmpDir: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-test-"))
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it("retorna arquivos corretos de um diretório com subdiretórios", () => {
        fs.writeFileSync(path.join(tmpDir, "a.ts"), "")
        fs.mkdirSync(path.join(tmpDir, "sub"))
        fs.writeFileSync(path.join(tmpDir, "sub", "b.ts"), "")

        const files = getFiles(tmpDir)

        expect(files).toHaveLength(2)
        expect(files).toContain(path.resolve(tmpDir, "a.ts"))
        expect(files).toContain(path.resolve(tmpDir, "sub", "b.ts"))
    })

    it("não inclui arquivos de node_modules", () => {
        fs.writeFileSync(path.join(tmpDir, "a.ts"), "")
        fs.mkdirSync(path.join(tmpDir, "node_modules"))
        fs.writeFileSync(path.join(tmpDir, "node_modules", "lib.js"), "")

        const files = getFiles(tmpDir)

        expect(files).toHaveLength(1)
        expect(files).toContain(path.resolve(tmpDir, "a.ts"))
        files.forEach(f => expect(f).not.toContain("node_modules"))
    })

    it("retorna array vazio para diretório vazio", () => {
        expect(getFiles(tmpDir)).toEqual([])
    })
})

describe("makeAbsolute", () => {
    let tmpDir: string

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsarch-makeabs-"))
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it("com arquivo existente resolve relativamente ao diretório do arquivo", () => {
        const refFile = path.join(tmpDir, "ref.ts")
        fs.writeFileSync(refFile, "")
        fs.writeFileSync(path.join(tmpDir, "target.ts"), "")

        const result = makeAbsolute(refFile, ["target.ts"])

        expect(result).toHaveLength(1)
        expect(result[0]).toBe(path.resolve(tmpDir, "target.ts"))
    })

    it("com caminho inexistente NÃO lança exceção (BUG-9 corrigido)", () => {
        const nonExistent = path.join(tmpDir, "does-not-exist.ts")
        expect(() => makeAbsolute(nonExistent, ["some/file.ts"])).not.toThrow()
    })

    it("com diretório existente resolve a partir do cwd", () => {
        const result = makeAbsolute(tmpDir, ["some/file.ts"])
        expect(result).toHaveLength(1)
        expect(result[0]).toBe(path.resolve("some/file.ts"))
    })
})
