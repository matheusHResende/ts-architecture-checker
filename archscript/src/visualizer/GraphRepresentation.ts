import { Digraph, digraph, Edge, NodeAttributes, toDot } from "ts-graphviz"
import { Representation } from "./Representation"
import { CliRenderer } from "@diagrams-ts/graphviz-cli-renderer"


export class GraphRepresentation extends Representation {
    graph: Digraph

    constructor(data: Map<string, string[]>, drifts?: string[][]) {
        super(data, drifts)
        this.graph = digraph('G');

        data.forEach((value, key) => {
            value.forEach(v => {
                let nodeAttributes: NodeAttributes = {}
                if (drifts?.some(drift => drift[0] === key && drift[1] === v)) {
                    nodeAttributes = { color: "red", style: "dashed" }
                }
                this.graph.createEdge([this.graph.createNode(key), this.graph.createNode(v)], nodeAttributes)
            })
        })
    }

    async render(fileName: string) {
        const r = CliRenderer({ outputFile: fileName, format: "png" });
        (async () => {
            try {
                await r(
                    toDot(this.graph)
                );
            } catch (error) {
                console.log(error);
            }
        })();
    }
}