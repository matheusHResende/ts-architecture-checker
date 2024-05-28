import * as ts from "typescript"
import { CustomType } from "./custom_type"
import { Entity } from "./entity"
import { TypeScriptModule } from "./typescript_module"
import { Importation } from "./importation"
import { makeAbsolute, existFile } from "../utils/fileSystem"

export function parse(files: string[], programDir: string) {
    const compilerOptions = ts.convertCompilerOptionsFromJson("compilerOptions", programDir, "tsconfig.json")
    const program = ts.createProgram(files, compilerOptions.options);
    const typeChecker = program.getTypeChecker()

    const sourceFiles = program.getSourceFiles().filter(files => !files.fileName.includes("node_modules"))
    const symbols = sourceFiles.map(file => new Parser(file, typeChecker).getSymbols())

    let types = new Map<string, CustomType[]>()

    symbols.forEach(tsModule => tsModule.types.forEach((customType, typeName) => {
        let t = types.get(typeName)
        t = t ? t : []
        types.set(typeName, [...t, ...customType])
    }))
    symbols.forEach(tsModule => tsModule.entities.forEach((entity) => {
        entity.forEach(e => e.setTypeReference(types))
    }))

    return symbols
}

type HasType = ts.VariableDeclaration | ts.FunctionDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration |
    ts.ParameterDeclaration | ts.PropertySignature | ts.ArrowFunction

class Parser {
    sourceFile: ts.SourceFile
    typeChecker: ts.TypeChecker

    module: TypeScriptModule

    constructor(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
        this.sourceFile = sourceFile
        this.typeChecker = typeChecker
        // console.log(sourceFile.fileName)
        this.module = new TypeScriptModule(sourceFile.fileName)
    }

    getLine(position: number) {
        return this.sourceFile.getLineAndCharacterOfPosition(position).line + 1
    }

    deduceType(node: HasType): [string, string?] {
        let qualifiedName = this.getQuallifiedName(node)

        let typeSymbol = this.typeChecker.getTypeAtLocation(node)
        let type = this.typeChecker.typeToString(typeSymbol)

        return [type, qualifiedName]
    }

    deduceReturn(node: HasType): [string, string?] {
        let qualifiedName = this.getQuallifiedName(node)
        let typeSymbol = this.typeChecker.getTypeAtLocation(node)
        let type = this.typeChecker.typeToString(typeSymbol)

        return [type.split("=>")[1].trim(), qualifiedName]
    }

    private getQuallifiedName(node: ts.Node) {
        let type = this.typeChecker.getTypeAtLocation(node).getSymbol()
        if (type === undefined) {
            return undefined
        }
        let fqn = this.typeChecker.getFullyQualifiedName(type)
        if (fqn?.match(/^".*"\./g) && !fqn.includes("node_modules")) {
            return fqn.split(".")[0].replaceAll('"', "") + ".ts"
        }
        return undefined
    }

    protected visitImportDeclaration(declaration: ts.ImportDeclaration) {
        let moduleSpecifier = declaration.moduleSpecifier.getText().replaceAll(/['"]/g, "")
        let internal = moduleSpecifier.startsWith(".")
        let source = moduleSpecifier
        if (internal) {
            let pathBase = makeAbsolute(this.sourceFile.fileName, [moduleSpecifier])[0]
            source = pathBase + ".ts" // Transform to absolute path to simplify analisis
            source = existFile(source) ? source : pathBase + "/index.ts"
        }
        let line = this.getLine(declaration.end)
        let name = declaration.importClause?.name?.getText()
        let bindings = declaration.importClause?.namedBindings
        let entity: string[] = []
        if (name !== undefined) {
            entity.push(name)
        }

        bindings?.forEachChild(child => { entity.push(...child.getText().split(" as ")) })

        entity.forEach(entity => this.module.addImportation(new Importation(entity, source, line, internal)))
    }

    protected visitVariableDeclaration(declaration: ts.VariableDeclaration) {
        let name = declaration.name.getText()
        let [type, qualifiedName] = this.deduceType(declaration)
        let line = this.getLine(declaration.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitClassDeclaration(node: ts.ClassDeclaration) {
        let name = node.name?.getText()
        name = name ? name : "__annonimous_class"
        let heirtages: string[] = []
        node.heritageClauses?.forEach(heirtance => heirtance.types.forEach(t => heirtages.push(t.getText())))
        let module = this.sourceFile.fileName
        let line = this.getLine(node.pos)

        this.module.addCustomType(new CustomType(name, line, module, heirtages))
    }

    protected visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
        let name = node.name.getText()
        let heirtages: string[] = []
        node.heritageClauses?.forEach(heirtance => heirtance.types.forEach(t => heirtages.push(t.getText())))
        let module = this.sourceFile.fileName
        let line = this.getLine(node.pos)

        this.module.addCustomType(new CustomType(name, line, module, heirtages))
    }

    protected visitFunctionDeclaration(node: ts.FunctionDeclaration) {
        let name = node.name?.getText()
        name = name ? name : "__annonimous"
        let [type, qualifiedName] = this.deduceReturn(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitMethodDeclaration(node: ts.MethodDeclaration) {
        let name = node.name.getText()
        let [type, qualifiedName] = this.deduceReturn(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitParameter(node: ts.ParameterDeclaration) {
        let name = node.name.getText()
        let [type, qualifiedName] = this.deduceType(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitTypeAliasDeclaration(node: ts.TypeAliasDeclaration) {
        let name = node.name.getText()
        let line = this.getLine(node.pos)
        let file = this.sourceFile.fileName

        this.module.addCustomType(new CustomType(name, line, file))
    }

    protected visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        let name = node.name.getText()
        let [type, qualifiedName] = this.deduceType(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitPropertySignature(node: ts.PropertySignature) {
        let name = node.name.getText()
        let [type, qualifiedName] = this.deduceType(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitArrowFunction(node: ts.ArrowFunction) {
        let name = "__annonimous"
        let [type, qualifiedName] = this.deduceReturn(node)
        let line = this.getLine(node.pos)

        this.module.addEntity(new Entity(name, type, line, qualifiedName))
    }

    protected visitEnumDeclaration(node: ts.EnumDeclaration) {
        let name = node.name.getText()
        let file = this.sourceFile.fileName
        let line = this.getLine(node.pos)

        this.module.addCustomType(new CustomType(name, line, file))
    }

    protected visitNode(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.EnumDeclaration:
                this.visitEnumDeclaration(node as ts.EnumDeclaration)
                break
            case ts.SyntaxKind.ClassDeclaration:
                this.visitClassDeclaration(node as ts.ClassDeclaration)
                break
            case ts.SyntaxKind.InterfaceDeclaration:
                this.visitInterfaceDeclaration(node as ts.InterfaceDeclaration)
                break
            case ts.SyntaxKind.TypeAliasDeclaration:
                this.visitTypeAliasDeclaration(node as ts.TypeAliasDeclaration)
                break
            case ts.SyntaxKind.VariableDeclaration:
                this.visitVariableDeclaration(node as ts.VariableDeclaration)
                break
            case ts.SyntaxKind.ImportDeclaration:
                this.visitImportDeclaration(node as ts.ImportDeclaration)
                break
            case ts.SyntaxKind.FunctionDeclaration:
                this.visitFunctionDeclaration(node as ts.FunctionDeclaration)
                break
            case ts.SyntaxKind.ArrowFunction:
                this.visitArrowFunction(node as ts.ArrowFunction)
                break
            case ts.SyntaxKind.MethodDeclaration:
                this.visitMethodDeclaration(node as ts.MethodDeclaration)
                break
            case ts.SyntaxKind.PropertyDeclaration:
                this.visitPropertyDeclaration(node as ts.PropertyDeclaration)
                break
            case ts.SyntaxKind.Parameter:
                this.visitParameter(node as ts.ParameterDeclaration)
                break
            case ts.SyntaxKind.PropertySignature:
                this.visitPropertySignature(node as ts.PropertySignature)
                break
        }
        ts.forEachChild(node, child => { this.visitNode(child) })
    }

    public getSymbols() {
        this.visitNode(this.sourceFile)
        return this.module
    }
}
