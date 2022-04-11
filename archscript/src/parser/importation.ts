class Importation {
    importedSymbols: Array<string>
    package: string
    module: string
    internalDependency: boolean
    absolutePath: string

    constructor(basePath: string, importedModule: string, importedNames: Array<string>) {
        this.importedSymbols = importedNames
        importedModule = importedModule.toString().replaceAll('"', "")
        this.internalDependency = importedModule.startsWith(".")
        
        let splitedPath = importedModule.split('/')
        this.module = splitedPath[splitedPath.length-1]
        this.package = splitedPath.slice(0, -1).join('/')
        if(this.internalDependency) {
            const splitedBasePath = basePath.split('/').slice(0,-1)
            splitedPath.forEach(piece => {
                if(piece === "..")
                    splitedBasePath.pop()
            })
            splitedPath = splitedPath.filter(piece => piece !== ".."  && piece !== ".")
            splitedBasePath.push(...splitedPath.slice(0,-1))
            this.package = splitedBasePath.join('/')
            this.absolutePath = `${this.package}/${this.module}`
        }
        else {
            this.absolutePath = importedModule
        }
    }
}

export { Importation }