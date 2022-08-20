export class CustomType {
    name: string
    line: number
    file: string
    typeReferences: string[]
    heirtages: string[]

    constructor(name: string, line: number, file: string, heirtages?: string[]) {
        this.name = name
        this.line = line
        this.file = file
        this.typeReferences = []
        this.heirtages = heirtages ? heirtages : []
    }

    getName(): string {
        return this.name
    }

    getLine(): number {
        return this.line
    }

    getFile(): string {
        return this.file
    }

    setFileReferences(types: Map<string, CustomType[]>) {
        this.heirtages.forEach(t => {
            let tr = types.get(t)?.map(ct => ct.getFile())
            if (tr)
                this.typeReferences.push(...tr)
        })
    }
}