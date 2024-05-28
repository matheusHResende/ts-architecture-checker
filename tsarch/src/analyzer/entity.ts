import { CustomType } from "./custom_type"

const DELIMITER = /[<>\.,;{}\(\)\|&\[\]'"]/g

export class Entity {
    name: string
    type: string[]
    line: number
    qualifiedName?: string

    typeReference: string[]

    constructor(name: string, type: string, line: number, qualifiedName?: string) {
        this.name = name
        if (type.includes("=>")) {
            type = type.split("=>")[1].trim()
        }
        this.type = [...new Set(type.split(DELIMITER).map(t => t.trim()).filter(c => c.length > 0))]
        this.type = this.type.map(type => {
            if (type.includes(":")) {
                return type.split(":")[1].trim()
            }
            return type
        }).filter(c => c.length > 0)
        this.line = line
        this.typeReference = []
        this.qualifiedName = qualifiedName
    }

    public setTypeReference(types: Map<string, CustomType[]>) {
        this.type.forEach(t => {
            let customType = types.get(t)
            let tr = customType?.map(ct => ct.getFile())
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
