import { Representation } from "./Representation";

export class MatrixRepresentation extends Representation {
    constructor(data: Map<string, string[]>, drifts: string[][]) {
        super(data, drifts)
    }

    render(fileName: string) {
        console.log("renderging matrix...")
    }
}