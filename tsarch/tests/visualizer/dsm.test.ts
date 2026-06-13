import { DSM } from "../../src/visualizer/dsm"
import * as renderModule from "../../src/utils/render"
import { toDot } from "ts-graphviz"
import { Digraph } from "ts-graphviz"

// Mock do render do graphviz para não invocar ferramenta externa
jest.mock("../../src/utils/render", () => ({
    render: jest.fn()
}))

describe("DSM", () => {
    let capturedGraph: Digraph | null = null

    beforeEach(() => {
        capturedGraph = null
        jest.clearAllMocks()
        ;(renderModule.render as jest.Mock).mockImplementation((graph: Digraph, _name: string) => {
            capturedGraph = graph
        })
    })

    function getDotLabel(): string {
        if (capturedGraph === null) return ""
        return toDot(capturedGraph)
    }

    describe("generate()", () => {
        it("chama render exatamente uma vez", () => {
            const dsm = new DSM([], [], [], [])
            dsm.generate("/tmp/dsm.png")
            expect(renderModule.render).toHaveBeenCalledTimes(1)
        })

        it("matriz vazia gera nó DSM sem linhas de dados", () => {
            const dsm = new DSM([], [], [], [])
            dsm.generate("/tmp/dsm.png")
            expect(renderModule.render).toHaveBeenCalledTimes(1)
            expect(renderModule.render).toHaveBeenCalledWith(expect.anything(), "/tmp/dsm.png")
        })
    })

    describe("render()", () => {
        it("chama render exatamente uma vez por invocação", () => {
            const dsm = new DSM([], [], [], [])
            dsm.render([[]], ["ModuleA"], "/tmp/test.png")
            expect(renderModule.render).toHaveBeenCalledTimes(1)
        })

        it("passa o nome de arquivo correto para render", () => {
            const dsm = new DSM([], [], [], [])
            dsm.render([[]], ["ModuleA"], "/tmp/custom-name.png")
            expect(renderModule.render).toHaveBeenCalledWith(expect.anything(), "/tmp/custom-name.png")
        })

        it("célula de ausência gera bgcolor red e símbolo X", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{ size: 1, type: "absence" }]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="red"')
            expect(dot).toContain(">X1<")
        })

        it("célula de divergência gera bgcolor orange e símbolo !", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{ size: 2, type: "divergence" }]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="orange"')
            expect(dot).toContain(">!2<")
        })

        it("célula de alerta gera bgcolor darkgray e símbolo ?", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{ size: 3, type: "alert" }]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="darkgray"')
            expect(dot).toContain(">?3<")
        })

        it("célula sem tipo gera bgcolor white sem símbolo", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{}]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="white"')
            expect(dot).toContain("><")
        })

        it("nomes dos nós aparecem no label com índice iniciando em 1", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{}]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain("1 - ModuleA")
        })

        it("header da coluna contém índice 1-based para cada nó", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{}, {}], [{}, {}]]
            const nodes = ["Alpha", "Beta"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain(">1<")
            expect(dot).toContain(">2<")
            expect(dot).toContain("1 - Alpha")
            expect(dot).toContain("2 - Beta")
        })

        it("matriz 2x2 mista renderiza múltiplas cores corretamente", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [
                [{ size: 1, type: "absence" },  { size: 2, type: "divergence" }],
                [{ size: 3, type: "alert" },     {}],
            ]
            const nodes = ["Alpha", "Beta"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="red"')
            expect(dot).toContain('bgcolor="orange"')
            expect(dot).toContain('bgcolor="darkgray"')
            expect(dot).toContain('bgcolor="white"')
        })

        it("não lança exceção com matriz vazia de linhas", () => {
            const dsm = new DSM([], [], [], [])
            expect(() => dsm.render([], [], "/tmp/test.png")).not.toThrow()
        })

        it("tipo desconhecido é tratado como branco sem símbolo", () => {
            const dsm = new DSM([], [], [], [])
            const matrix = [[{ size: 5, type: "convergence" }]]
            const nodes = ["ModuleA"]
            dsm.render(matrix, nodes, "/tmp/test.png")

            const dot = getDotLabel()
            expect(dot).toContain('bgcolor="white"')
            expect(dot).toContain(">5<")
        })
    })
})
