export class Importation {
    entity: string
    source: string
    line: number
    internal: boolean

    constructor(entity: string, source: string, line: number, internal: boolean) {
        this.entity = entity
        this.source = source
        this.line = line
        this.internal = internal
    }

    public getSource(): string {
        return this.source
    }

    public getEntity(): string {
        return this.entity
    }

    public getLine(): number {
        return this.line
    }
}