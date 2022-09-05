import { Occurrence } from "../conformancer/conformancer";
import { Viewer } from "./viewer";
import { render } from "../utils/render"
import { digraph, EdgeAttributes, NodeAttributes, RootClusterAttributes } from "ts-graphviz"


interface Edge {
    from: string
    to: string
    size: number
    type: string
}

function edgeHelper(occurence: Occurrence, edges: Map<string, Edge>, type: string) {
    if (occurence.originModule === undefined || occurence.targetModule === undefined) return
    if (occurence.originModule === occurence.targetModule) return
    // let edge = edges.get(occurence.originModule+"+"+occurence.targetModule+"+"+type)
    let edge = edges.get(occurence.originModule+"+"+occurence.targetModule)
    if (edge === undefined) {
        edge = {
            from: occurence.originModule,
            to: occurence.targetModule,
            type: type,
            size: 0
        }
    }
    if (type === edge.type) {
        edge.size += 1
    }
    else if (type === "absence" && edge.type == "convergence") {
        edge.type = type
        edge.size = 1
    }
    // edges.set(occurence.originModule+"+"+occurence.targetModule+"+"+type, edge)
    edges.set(occurence.originModule+"+"+occurence.targetModule, edge)
}

interface Complement {
    label: (size: number) => string
    color?: string
    style?: string
}

export class Graph extends Viewer {
    generate(): void {
        let nodes = new Set<string>()
        let edges = this.getEdges()
        edges.forEach(edge => {
            nodes.add(edge.from)
            nodes.add(edge.to)
        })


        let graphAttributes: RootClusterAttributes = {
            layout: "sfdp",
            start: "random",
            normalize: 0,
        }
        const graph = digraph("G", graphAttributes)
        nodes.forEach(node => {
            let nodeAttributes: NodeAttributes = {
                shape: "box",
                style: "rounded"
            }
            graph.createNode(node, nodeAttributes)
        })

        const complements = new Map<string, Complement>()
        complements.set("convergence", {
            label: (size: number) => `#${size}`,
        })
        complements.set("absence", {
            label: (size: number) => `X(#${size})`,
            color: "red",
            style: "dashed"
        })
        complements.set("divergence", {
            label: (size: number) => `!(#${size})`,
            color: "orange",
            style: "dashed"
        })
        edges.forEach(edge => {
            let complement = complements.get(edge.type)
            if (complement == undefined) return
            let edgeAttributes: EdgeAttributes = {
                label: complement.label(edge.size),
                color: complement.color,
                fontcolor: complement.color,
                style: complement.style,
                //len: 2
            }
            graph.createEdge([edge.from, edge.to], edgeAttributes)
        })
        render(graph, "a.png")
    }
    
    getEdges(): Edge[] {
        let edges = new Map<string, Edge>()
        this.convergencies.forEach(occurence => edgeHelper(occurence, edges, "convergence"))
        this.absences.forEach(occurence => edgeHelper(occurence, edges, "absence"))
        this.divergencies.forEach(occurence => edgeHelper(occurence, edges, "divergence"))
        let ed: Edge[] = []
        edges.forEach(edge => ed.push(edge))
        return ed
    }

}