import { readFileSync } from "fs"
import ts, { SyntaxKind as sk } from "typescript";

function printRecursiveFrom(
    node: ts.Node, indentLevel: number
) {
    const indentation = "-".repeat(indentLevel);
    const syntaxKind = ts.SyntaxKind[node.kind];
    console.log(`${indentation}${syntaxKind}`);
    node.forEachChild(child =>
        printRecursiveFrom(child, indentLevel + 1)
    );
}

abstract class ParsedSymbol {
    identifier: string
    localIdentifier: string
    exported: boolean
    references: string[]
    types?: string[]

    constructor(identifier: string, localIdentifier: string, type?: string, exported?: boolean) {
        this.identifier = identifier
        if (type)
            this.types = type?.replaceAll(/[\[\]>]/g, '').replaceAll(/[\<\|]/g, ',').split(',').map(t => t.trim())
        else
            this.types = undefined
        this.exported = exported ? exported : false
        this.localIdentifier = localIdentifier
        this.references = []
    }

    abstract inferType(): void
    abstract defineTypeReferences(): void
}

class Function extends ParsedSymbol {
    body?: ts.Block

    constructor(identifier: string, localIdentifier: string, type?: string, body?: ts.Block, exported?: boolean) {
        super(identifier, localIdentifier, type, exported)
        this.body = body
    }

    inferType(): void {

    }

    defineTypeReferences(): void {

    }
}

class Variable extends ParsedSymbol {
    initializer?: ts.Expression
    constructor(identifier: string, localIdentifier: string, type?: string, initializer?: ts.Expression, exported?: boolean) {
        super(identifier, localIdentifier, type, exported)
        this.initializer = initializer
    }

    setInitializer(initializer?: ts.Expression) {
        this.initializer = initializer
    }

    defineTypeReferences(): void {
        this.inferType()
        // Palavras reservadas padrão da linguagem utilizadas para definir tipos
        const reservedTypeKeywords = new Set(["boolean", "number", "string", "any", "void", "undefined", "null"])
        // Tipos de objetos padrão da linguagem
        const languageTypes = new Set(["Array", "Object", "Map", "Set", "Partial", "Required", "ReadOnly", "Record", "Pick",
            "Omit", "Exclude", "Extract", "NonNullable", "Parameters", "ConstructorParameters", "ReturnType", "InstanceType",
            "ThisParameterType", "OmitThisParameter", "ThisType", "Uppercase", "Lowercase", "Capitalize", "Uncapitalize"])
        if (!this.types)
            return
        let unreferedTypes: string[] = [...this.types]
        this.types.forEach(t => {
            if (reservedTypeKeywords.has(t)) {
                unreferedTypes = unreferedTypes.filter(ut => ut != t)
                return
            }
            let baseType = t.split('.')[0] // Para quando importamos um namespace fazemos o split para identificar a base importada
            let importation = actualModule.importations.get(baseType)
            if (importation) {
                unreferedTypes = unreferedTypes.filter(ut => ut != t)
                this.references?.push(importation.sourceModule)
                return
            }
            let customType = actualModule.customTypes.get(t)
            if (customType) {
                unreferedTypes = unreferedTypes.filter(ut => ut != t)
                this.references?.push(customType.module)
                return
            }
            if (languageTypes.has(t)) {
                unreferedTypes = unreferedTypes.filter(ut => ut != t)
                return
            }
        })
        if (unreferedTypes.length > 0)
            console.log(unreferedTypes)
    }

    inferType(): void {
        if (this.types)
            return
        if (!this.initializer)
            return
        this.types = exploreType(this.initializer, this.identifier.split(".").slice(0, -1))
        // caso base: new, literais, binary+ expressions
        // passo recursivo: call expressions
    }
}

class CustomType {
    identifier: string
    fields: string[]
    methods: string[]
    inheirtance: string[]
    exported: boolean
    module: string

    constructor(identifier: string, fields: string[], methods: string[], inheirtance: string[], module: string, exported?: boolean) {
        this.identifier = identifier
        this.fields = fields
        this.methods = methods
        this.inheirtance = inheirtance
        this.exported = exported ? exported : false
        this.module = module
    }
}

class Importation {
    identifier: string
    sourceModule: string
    alias?: string
    internal: boolean

    constructor(sourceModule: string, identifier: string, alias?: string) {
        this.identifier = identifier
        this.sourceModule = sourceModule
        this.alias = alias
        this.internal = sourceModule.startsWith(".")
    }
}

class Module {
    name: string
    symbols: Map<string, ParsedSymbol>
    customTypes: Map<string, CustomType>
    importations: Map<string, Importation>
    variables: Map<string, Variable>
    functions: Map<string, Function>

    constructor(name: string) {
        this.name = name
        this.customTypes = new Map<string, CustomType>()
        this.symbols = new Map<string, ParsedSymbol>()
        this.importations = new Map<string, Importation>()
        this.variables = new Map<string, Variable>()
        this.functions = new Map<string, Function>()
    }
}

let namespace: string[]
let modules: Map<string, Module> = new Map<string, Module>()
let actualModule: Module

function getParsingFile(path: string): ts.SourceFile {
    return ts.createSourceFile(
        path,
        readFileSync(path).toString(),
        ts.ScriptTarget.ES2021,
        true,
        ts.ScriptKind.TS
    )
}

export function parse(file: string) {
    console.log(file)
    actualModule = new Module(file)
    modules.set(file, actualModule)
    namespace = []
    //const sourceFile = getParsingFile("./src/teste.ts")
    const sourceFile = getParsingFile(file)
    //printRecursiveFrom(sourceFile, 0)

    defineTableOfSymbols(sourceFile)
    expandTableOfSymbols()
    //symbols.forEach((value, key) => console.log(key, value.localIdentifier))    
}

function exploreType(node: ts.Node, namespace: string[]) {
    switch (node.kind) {
        case ts.SyntaxKind.NewExpression:
            return exploreNewExpression(node as ts.NewExpression)
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.TemplateExpression:
            return ["string"]
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.TrueKeyword:
            return ["boolean"]
        case ts.SyntaxKind.ArrayLiteralExpression:
            exploreArrayLiteral(node as ts.ArrayLiteralExpression, namespace)
            break
        case ts.SyntaxKind.CallExpression:
            break
        case ts.SyntaxKind.Identifier:
            return exploreIdentifier(node as ts.Identifier, namespace)
        case ts.SyntaxKind.BinaryExpression:
            node as ts.BinaryExpression
        case ts.SyntaxKind.PropertyAccessExpression:
            node as ts.PropertyAccessExpression
        case ts.SyntaxKind.ElementAccessExpression:
            break
        default:
            console.log("Default:", sk[node.kind])
    }
}

function exploreNewExpression(node: ts.NewExpression) {
    return [node.expression.getText()]
}

function exploreArrayLiteral(node: ts.ArrayLiteralExpression, namespace: string[]) {
    console.log(node.getText())
    printRecursiveFrom(node, 0)
}

function exploreIdentifier(node: ts.Identifier, namespace: string[]) {
    let found = false
    let variable: Variable | undefined
    while (namespace.length >= 0 && !found) {
        variable = actualModule.variables.get([...namespace, node.getText()].join("."))
        if (variable) {
            found = true
        }
        namespace.pop()
    }
    if (!found || !variable)
        throw new Error("Erro de compilação, atribuição de variável não declarada")
    variable?.inferType()
    return variable.types
}

function delintNode(node: ts.Node) {
    let name: string | undefined
    switch (node.kind) {
        case ts.SyntaxKind.FunctionDeclaration:
            name = functionDeclarationVisitor(node as ts.FunctionDeclaration)
            namespace.push(name)
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.MethodDeclaration:
            name = methodDeclarationVisitor(node as ts.MethodDeclaration)
            namespace.push(name)
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.ArrowFunction:
            name = arrowFunctionVisitor(node as ts.ArrowFunction)
            namespace.push(name)
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.VariableDeclaration: // Anywhere
            variableDeclarationVisitor(node as ts.VariableDeclaration)
            break
        case ts.SyntaxKind.PropertySignature: // Interface
            break
        case ts.SyntaxKind.PropertyDeclaration: // Classe
            break
        case ts.SyntaxKind.Parameter: // Function/Method
            parameterVisitor(node as ts.ParameterDeclaration)
            break
        case ts.SyntaxKind.ClassDeclaration:
            name = classDeclaratinVisitor(node as ts.ClassDeclaration)
            namespace.push(name)
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.InterfaceDeclaration:
            interfaceDeclarationVisitor(node as ts.InterfaceDeclaration)
            node.forEachChild(delintNode)
            break
        case ts.SyntaxKind.EnumDeclaration:
            enumDeclarationVisitor(node as ts.EnumDeclaration)
            node.forEachChild(delintNode)
        case ts.SyntaxKind.ImportDeclaration:
            importDeclarationVisitor(node as ts.ImportDeclaration)
            break
        case ts.SyntaxKind.ExportAssignment:
            break
        case ts.SyntaxKind.ExportDeclaration:
            break
        case ts.SyntaxKind.ExportSpecifier:
            break
        case ts.SyntaxKind.ImportDeclaration:
            importDeclarationVisitor(node as ts.ImportDeclaration)
            break
        default:
            node.forEachChild(delintNode)
    }
}

function methodDeclarationVisitor(node: ts.MethodDeclaration) {
    return functionDeclarationVisitor(node)
}

function functionDeclarationVisitor(functionNode: ts.FunctionDeclaration | ts.MethodDeclaration): string {
    let localName = functionNode.name?.getText()
    let name = [...namespace, localName].join('.')
    let type = functionNode.type?.getText()
    let body = functionNode.body
    let func = new Function(name, localName ? localName : "__annonymous_function__", type, body)
    actualModule.symbols.set(name, func)
    actualModule.functions.set(name, func)
    return localName ? localName : "__annonymous_function__"
}

function interfaceDeclarationVisitor(node: ts.InterfaceDeclaration) {
    let name = node.name.text
    let fields = node.members.filter(member => member.kind == ts.SyntaxKind.PropertyDeclaration)
        .map(member => member.name ? member.name.getText() : "__annonymous_field__")
    let methods = node.members.filter(member => member.kind == ts.SyntaxKind.MethodDeclaration)
        .map(member => member.name ? member.name.getText() : "__annonymous_method__")

    let inheirtance: string[] = []
    node.heritageClauses?.forEach(clause => clause.types.forEach(type => inheirtance.push(type.getText())))
    let fileName = node.getSourceFile().fileName.replace(".ts", "")
    actualModule.customTypes.set(name, new CustomType(name, fields, methods, inheirtance, fileName))

    return name
}

function classDeclaratinVisitor(classNode: ts.ClassDeclaration): string {
    let className = classNode.name?.text
    className = [...namespace, className === undefined ? "Annon" : className].join('.')
    let fields = classNode.members.filter(member => member.kind == ts.SyntaxKind.PropertyDeclaration)
        .map(member => member.name ? member.name.getText() : "__annonymous_field__")
    let methods = classNode.members.filter(member => member.kind == ts.SyntaxKind.MethodDeclaration)
        .map(member => member.name ? member.name.getText() : "__annonymous_method__")

    let inheirtance: string[] = []
    classNode.heritageClauses?.forEach(clause => clause.types.forEach(type => inheirtance.push(type.getText())))
    let fileName = classNode.getSourceFile().fileName.replace(".ts", "")
    actualModule.customTypes.set(className, new CustomType(className, fields, methods, inheirtance, fileName))

    return className
}

function enumDeclarationVisitor(node: ts.EnumDeclaration) {

}

function setupVariable(variableNode: ts.VariableDeclaration | ts.ParameterDeclaration): Variable {
    let localName = variableNode.name.getText()
    let name = [...namespace, variableNode.name.getText()].join('.')
    let type = variableNode.type?.getText()
    let variable = new Variable(name, localName, type)
    actualModule.symbols.set(name, variable)
    actualModule.variables.set(name, variable)
    return variable
}

function variableDeclarationVisitor(variableNode: ts.VariableDeclaration): string {
    let variable = setupVariable(variableNode)
    let initializer = variableNode.initializer
    variable.setInitializer(initializer)

    return variable.localIdentifier
}

function parameterVisitor(node: ts.ParameterDeclaration) {
    return setupVariable(node).localIdentifier
}

function defineTableOfSymbols(sourceFile: ts.SourceFile) {
    sourceFile.forEachChild(delintNode)
}

function importDeclarationVisitor(importDeclaration: ts.ImportDeclaration) {
    let sourceModule = importDeclaration.moduleSpecifier.getText().replaceAll(/['"]/g, "")
    let importNames: string[] = []
    let importClause = importDeclaration.importClause
    if (importClause) {
        if (importClause.namedBindings) {
            let namedBindings = importClause.namedBindings.getText()
            namedBindings = namedBindings.replaceAll(/[\{\}"']/g, "")
            importNames.push(...namedBindings.split(",").map(str => str.trim()))
        }
        if (importClause.name) {
            let unnamedBindings = importClause.name.getText()
            importNames.push(...unnamedBindings.split(","))
        }
    }
    let name_alias = importNames.map(name => name.split(" as "))
    name_alias.forEach(na => {
        let importation = new Importation(sourceModule, na[0], na[1])
        if (na[1]) {
            actualModule.importations.set(na[1], importation)
        }
        actualModule.importations.set(na[0], importation)
    })
}

function arrowFunctionVisitor(node: ts.ArrowFunction) {
    return "__arrow_function__"
}

function expandTableOfSymbols() {
    actualModule.variables.forEach(variable => variable.defineTypeReferences())
    actualModule.functions.forEach(func => func.defineTypeReferences())
}
