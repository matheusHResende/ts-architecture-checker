import { CustomType } from "./custom_type"

const DELIMITER = /[<>\.,;:{}\(\)\|&'"\[\]]/g

export class Entity {
    name: string
    type: string[]
    line: number

    typeReference: string[]

    constructor(name: string, type: string, line: number) {
        this.name = name
        if (type.includes("=>")) {
            type = type.split("=>")[1].trim()
        }
        this.type = [...new Set(type.split(DELIMITER).map(t => t.trim()).filter(c => c.length > 0))]
        this.line = line
        this.typeReference = []
    }

    public setTypeReference(types: Map<string, CustomType[]>) {
        this.type.forEach(t => {
            let tr = types.get(t)?.map(ct => ct.getFile())
            if (tr)
                this.typeReference.push(...tr)
        })
    }

    public getName(): string {
        return this.name
    }

    public getLine(): number {
        return this.line
    }

    public getType(): string[] {
        return this.type
    }
}
