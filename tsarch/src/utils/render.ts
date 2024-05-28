import { Digraph, toDot } from "ts-graphviz"
import { CliRenderer } from "@diagrams-ts/graphviz-cli-renderer"

export function render(graph: Digraph, fileName: string): void {
    const r = CliRenderer({ outputFile: fileName, format: "png" });
    (async () => {
        try {
            await r(
                toDot(graph)
            );
        } catch (error) {
            console.log(error);
        }
    })();
}