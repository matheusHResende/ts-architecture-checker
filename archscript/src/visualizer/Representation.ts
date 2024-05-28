export abstract class Representation {
    data: Map<string, string[]>
    drifts?: string[][]

    constructor(data: Map<string, string[]>, drifts?: string[][]) {
        this.data = data
        this.drifts = drifts
    }

    abstract render(fileName: string): void
}