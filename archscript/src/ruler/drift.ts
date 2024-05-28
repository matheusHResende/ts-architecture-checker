export class Drift {
    rule: string // allowed, required
    module: string // module where are the dependency
    file: string // file that failed
    targetFile: string // target file of the drift
    targetModule: string // module that target file belongs

    constructor(rule: string, module: string, file: string, targetFile: string, targetModule: string) {
        this.rule = rule
        this.module = module
        this.file = file
        this.targetFile = targetFile
        this.targetModule = targetModule
    }

    toString(): string {
        // [dataAccess:required:HasId] EntityStore does not depend on HasId.
        const helper: any = {
            "allowed": "can't",
            "required": "must"
        }
        return `[${this.module}:${this.rule}:${this.targetModule}] ${this.file} ${helper[this.rule]} depend of ${this.targetFile}`
    }
}