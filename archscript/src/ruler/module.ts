export class Module {
    name: string
    files: string[]
    allowed?: string[]
    forbidden?: string[]
    required?: string[]


    constructor(name: string, files: string[], allowed?: string[], forbidden?: string[], required?: string[]) {
        this.name = name
        this.files = files
        this.allowed = allowed
        this.forbidden = forbidden
        this.required = required
    }

    getExpandableNames(): Set<string> {
        const fileCollections = [this.files, this.allowed, this.forbidden, this.required]
        const expandableNames = new Set<string>()
        for (const fileCollection of fileCollections) {
            fileCollection?.forEach(file => {
                if (file.endsWith('*'))
                    expandableNames.add(file)
            })
        }
        return expandableNames
    }

    isValid(modules: string[]) {
        const rules = [this.allowed, this.forbidden, this.required]
        for (const rule of rules) {
            if (rule != undefined) {
                const referedModules = rule.filter(file => !file.startsWith('/'))
                for (const m of referedModules) {
                    if (!modules.some(module => module == m))
                        return false
                }
            }
        }
        return true
    }

    expandRules(nameCache: Map<string, string[]>): void {
        for (const collection of [this.files, this.allowed, this.forbidden, this.required]) {
            collection?.forEach(file => {
                const files = nameCache.get(file)
                if (files !== undefined) {
                    collection.push(...files)
                }
            })
        }
    }

    setModuleReference(modulesFiles: Map<string, string[]>): void {
        for (let collection of [this.allowed, this.forbidden, this.required]) {
            collection?.forEach(file => {
                const files = modulesFiles.get(file)
                if (files !== undefined) {
                    collection?.push(...files)
                }
            })
        }
    }

    clean(): void {
        this.files = [...new Set(this.files)].filter(file => file.startsWith("/") && !file.endsWith("*"))
        this.allowed = this.allowed ? [...new Set(this.allowed)].filter(file => file.startsWith("/") && !file.endsWith("*")) : undefined
        this.forbidden = this.forbidden ? [...new Set(this.forbidden)].filter(file => file.startsWith("/") && !file.endsWith("*")) : undefined
        this.required = this.required ? [...new Set(this.required)].filter(file => file.startsWith("/") && !file.endsWith("*")) : undefined
    }

    simplify(available: string[]): void {
        if (this.forbidden === undefined && this.allowed !== undefined) return
        this.allowed = available.filter(avl => !this.forbidden?.some(fbd => fbd === avl))
        this.forbidden = []
    }
}
