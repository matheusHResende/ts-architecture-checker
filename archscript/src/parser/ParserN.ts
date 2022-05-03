import { readFileSync } from "fs"
import ts from "typescript";

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

interface Component {
    name: string
    type: string
    kind: string
}

interface CustomType {
    name: string
    kind: string
}

let tableOfSymbols: Map<string, Component>
let customTypes: Map<string, CustomType>
let namespace: string[]

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
    tableOfSymbols = new Map<string, Component>()
    customTypes = new Map<string, CustomType>()
    namespace = []

    //const sourceFile = getParsingFile("./src/teste.ts")
    const sourceFile = getParsingFile(file)
    //printRecursiveFrom(sourceFile, 0)
    defineTableOfSymbols(sourceFile)
}

function getIdentifier(node: ts.Node): string {
    let identifier: string = "default_identifier"
    let found = false
    node.forEachChild(child => {
        if (child.kind === ts.SyntaxKind.Identifier && !found) {
            identifier = child.getText()
            found = true
        }
    })

    return identifier
}

function getType(node: ts.Node): string {
    let type: string = "not defined"

    node.forEachChild(child => {
        switch (child.kind) {
            case ts.SyntaxKind.ArrayType:
                type = `${getType(child)}`
                break
            case ts.SyntaxKind.VoidKeyword:
                type = "void"
                break
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.StringLiteral:
                type = "string"
                break
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.NumericLiteral:
                type = "number"
                break
            case ts.SyntaxKind.AnyKeyword:
                type = "any"
                break
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
                type = "boolean"
                break
            case ts.SyntaxKind.TypeReference:
                type = child.getChildren().map(c => c.getText()).join("")
                break
            case ts.SyntaxKind.ArrayLiteralExpression: // Aprofundar quanto a outros tipos de array
                if (type === "default_type") {
                    type = "undefined array"
                }
                break
            case ts.SyntaxKind.NewExpression:
                child.forEachChild(c => {
                    switch (c.kind) {
                        case ts.SyntaxKind.Identifier:
                            type = c.getText()
                    }
                })
                break
        }
    })

    if (type === "not defined") {
        if (!node.getText().includes("=")) return "any"
        let right = `${node.getText().split("=").slice(-1)}`.trim()
        type = `1Nd/${right}`
    }
    return type
}

function getReturnType(node: ts.Node) {
    let isVoid = true
    node.forEachChild(child => {
        if (child.kind === ts.SyntaxKind.ReturnKeyword) isVoid = false
    })
    return isVoid ? "void" : getType(node)
}

function nameWithNamespace(identifier: string): string {
    const name = [...namespace, identifier]
    return name.join('.')
}

function delintNode(node: ts.Node) {
    let identifier
    switch (node.kind) {
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
            identifier = getIdentifier(node)
            console.log({
                name: nameWithNamespace(identifier),
                kind: ts.SyntaxKind[node.kind],
                type: getReturnType(node)
            })
            tableOfSymbols.set(nameWithNamespace(identifier), {
                name: nameWithNamespace(identifier),
                kind: ts.SyntaxKind[node.kind],
                type: getReturnType(node)
            })
        case ts.SyntaxKind.ArrowFunction:
            namespace.push(identifier != undefined ? identifier : "4rrow")
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.VariableDeclaration: // Anywhere
        case ts.SyntaxKind.PropertySignature: // Interface
        case ts.SyntaxKind.PropertyDeclaration: // Classe
        case ts.SyntaxKind.Parameter: // Function/Method
            identifier = getIdentifier(node)
            console.log({
                name: nameWithNamespace(identifier),
                kind: ts.SyntaxKind[node.kind],
                type: getType(node)
            })
            tableOfSymbols.set(nameWithNamespace(identifier), {
                name: nameWithNamespace(identifier),
                kind: ts.SyntaxKind[node.kind],
                type: getType(node)
            })
            break
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
            identifier = getIdentifier(node)
            customTypes.set(identifier, {
                name: identifier,
                kind: ts.SyntaxKind[node.kind]
            })
            namespace.push(identifier != undefined ? identifier : "arrow")
            node.forEachChild(delintNode)
            namespace.pop()
            break
        case ts.SyntaxKind.ImportDeclaration:
            break
        case ts.SyntaxKind.ExportAssignment:
        case ts.SyntaxKind.ExportDeclaration:
        case ts.SyntaxKind.ExportSpecifier:
            break
        default:
            node.forEachChild(delintNode)
    }
}

function defineTableOfSymbols(sourceFile: ts.SourceFile) {
    sourceFile.forEachChild(delintNode)
}

function expandTableOfSymbols() {

}