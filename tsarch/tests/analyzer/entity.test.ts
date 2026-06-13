import { Entity } from "../../src/analyzer/entity"

describe("Entity", () => {
    it("tipo simples", () => {
        const e = new Entity("x", "string", 1)
        expect(e.getType()).toEqual(["string"])
    })

    it("tipo genérico", () => {
        const e = new Entity("m", "Map<string, number>", 1)
        expect(e.getType()).toContain("Map")
        expect(e.getType()).toContain("string")
        expect(e.getType()).toContain("number")
    })

    it("tipo de função simples — extrai apenas o tipo de retorno", () => {
        const e = new Entity("f", "(x: Foo) => Bar", 1)
        expect(e.getType()).toContain("Bar")
        expect(e.getType()).not.toContain("Foo")
    })

    it("BUG-6: tipo de função de ordem superior — preserva todos os tipos após o primeiro =>", () => {
        // ANTES: "(A) => (B) => C".split("=>")[1] = " (B) " → tokens: ["B"]  — C é perdido
        // DEPOIS: substring(indexOf("=>") + 2) = "(B) => C" → tokens: ["B", "C"]
        const e = new Entity("f", "(A) => (B) => C", 1)
        expect(e.getType()).toContain("B")
        expect(e.getType()).toContain("C")
    })

    it("tipo sem seta — não modifica", () => {
        const e = new Entity("n", "number", 1)
        expect(e.getType()).toEqual(["number"])
    })

    it("tipo union", () => {
        const e = new Entity("u", "string | number", 1)
        expect(e.getType()).toContain("string")
        expect(e.getType()).toContain("number")
    })

    it("getName() e getLine() retornam valores corretos", () => {
        const e = new Entity("myVar", "boolean", 42)
        expect(e.getName()).toBe("myVar")
        expect(e.getLine()).toBe(42)
    })

    it("tipos duplicados são deduplicados via Set", () => {
        const e = new Entity("x", "string | string", 1)
        expect(e.getType()).toEqual(["string"])
    })

    it("tipo com Promise genérico", () => {
        const e = new Entity("fn", "() => Promise<void>", 1)
        expect(e.getType()).toContain("Promise")
        expect(e.getType()).toContain("void")
    })
})
