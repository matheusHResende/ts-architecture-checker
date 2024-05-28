import { readFileSync } from "fs"

interface Rule {
    name: string
    files: string[]
    allowed?: string[]
    forbidden?: string[]
    required?: string[]
}

export class Rules {
    rules: Map<string, Rule>
    constructor(path: string) {
        this.rules = new Map<string, Rule>()
        JSON.parse(readFileSync(path, "utf-8")).forEach((rule: Rule) => {
            this.rules.set(rule.name, rule)
        })
    }
}