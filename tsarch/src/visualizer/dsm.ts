import { Digraph } from "ts-graphviz";
import { Graph } from "./graph";
import {render} from "../utils/render"

interface Data {
    size?: number,
    type?: string
}

export class DSM extends Graph {
    generate(): void {
        let edges = this.getEdges()
        let nodes = new Map<string, number>()
        let index = 0
        edges.forEach(edge => {
            if (!nodes.has(edge.from)) {
                nodes.set(edge.from, index)
                index++ 
            }
            if (!nodes.has(edge.to)) {
                nodes.set(edge.to, index)
                index++
            }
        })

        let matrix: Data[][] = []
        for(let i = 0; i < index; i++) {
            matrix.push([])
            nodes.forEach(_ => matrix[i].push({}))
        }

        edges.forEach(edge => {
            let from = nodes.get(edge.from)
            let to = nodes.get(edge.to)
            if (from === undefined || to === undefined) return
            matrix[from][to] = {size: edge.size , type: edge.type}
        })
        let n: string[] = new Array(matrix.length)
        nodes.forEach((value, key) => n[value] = key)
        this.render(matrix, n)
    }
    render(matrix: Data[][], nodes: string[]) {
        let table = new Digraph()
        //...nodes.map((node, index) => `<TD colspan="2">${index} - ${node}</TD>`),

        let lines = matrix.map((line, index) => {
            let script = [
                '<TR>',
                // Escrever o side header
                `<TD colspan="2" align="LEFT">${index+1} - ${nodes[index]}</TD>`,
                ...line.map(data => {
                    let c = "white"
                    c = data.type == "absence" ? "red" : c
                    c = data.type == "divergence" ? "orange" : c
                    return `<TD bgcolor="${c}">${data.size ? data.size : ""}</TD>`
                }),
                '</TR>'
            ]
            return script.join("\n")
        })

        table.createNode("DSM", {
            label: ["<",
                '<TABLE border="1" cellspacing="0">',
                '<TH><TD colspan="2" bgcolor="darkgray">Modules</TD>',
                ...nodes.map((node, index) => `<TD bgcolor="darkgray">${index+1}</TD>`),
                '</TH>',
                ...lines,
                '</TABLE>>'].join("\n"),
            shape: "rect"
        })
        render(table, "b.png")
    }
}