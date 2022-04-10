class Component {
    module: string
    identifier: string
    kind: string
    type?: string
    namespace: Array<string>
    globalIdentifier: string
    exported: boolean

    constructor() {
        this.module = ""
        this.identifier = ""
        this.kind = ""
        this.namespace = []
        this.exported = false
        this.globalIdentifier = ""
    }

    defineGlobalIdentifier() {
        this.globalIdentifier = `${this.module}.${[...this.namespace, this.identifier].join(".")}`
    }
}

export { Component }