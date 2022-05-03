import { readFileSync } from "fs"
import { Importation } from "../project/importation";
import { Component } from "../project/component";
import ts from "typescript";
import { string } from "yargs";

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

const tableOfSymbols = new Map<string, any>()
const customTypes = new Map<string, any>()

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
    const sourceFile = getParsingFile(file)
    defineTableOfSymbols(sourceFile)
}

function delintNode(node: ts.Node) {
    switch (node.kind) {
        case ts.SyntaxKind.MethodDeclaration:
            // nome, tipoRetorno, tipoSimbolo
            break
        case ts.SyntaxKind.FunctionDeclaration:
            // nome, tipoRetorno, tipoSimbolo
            break
        case ts.SyntaxKind.VariableDeclaration:
            // nome, tipoObjeto, tipoSimbolo
            break
        case ts.SyntaxKind.PropertySignature: // Interface
        case ts.SyntaxKind.PropertyDeclaration: // Classe
            break
        case ts.SyntaxKind.Parameter:
            // nome, tipoObjeto, tipoSimbolo
            break
        case ts.SyntaxKind.ClassDeclaration:
            // nome, tipoSimbolo
            break
        case ts.SyntaxKind.InterfaceDeclaration:
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
}

function defineTableOfSymbols(sourceFile: ts.SourceFile) {
    sourceFile.forEachChild(delintNode)
}

function expandTableOfSymbols() {

}

class Parser {
    namespace: Array<string>
    sourceFile: ts.SourceFile

    constructor(path: string) {
        this.sourceFile = ts.createSourceFile(
            path,
            readFileSync(path).toString(),
            ts.ScriptTarget.ES2021,
            true,
            ts.ScriptKind.TS
        )
        this.namespace = []
    }


    run(module: string): [Array<Component>, Array<Importation>] {
        let namespaces: Array<string> = []
        let components: Array<Component> = []
        let importations: Array<Importation> = []

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

        function isExported(node: ts.Node): boolean {
            let exported = false
            node.forEachChild(child => {
                if (child.kind === ts.SyntaxKind.ExportKeyword) {
                    exported = true
                }
            })
            return exported
        }

        function getImportation(node: ts.Node) {
            let importedModule = ""
            let namedImports: Array<string> = []
            function parseImportation(child: ts.Node) {
                switch (child.kind) {
                    case ts.SyntaxKind.StringLiteral:
                        importedModule = child.getText()
                        break
                    case ts.SyntaxKind.ImportSpecifier:
                        namedImports.push(getIdentifier(child))
                        break
                    default:
                        child.forEachChild(parseImportation)
                }
            }
            node.forEachChild(parseImportation)
            return new Importation(module, importedModule, namedImports)
        }

        function getType(node: ts.Node): string {
            let type: string = "any"
            node.forEachChild(child => {
                switch (child.kind) {
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
            return type
        }

        function delintNode(node: ts.Node) {
            let component = new Component()
            component.namespace = [...namespaces]
            component.module = module
            switch (node.kind) {
                case ts.SyntaxKind.MethodDeclaration:
                    component.kind = "method"
                case ts.SyntaxKind.FunctionDeclaration:
                    component.kind = "function"
                    break
                case ts.SyntaxKind.VariableDeclaration:
                    component.kind = "variable"
                    component.type = getType(node)
                    break
                case ts.SyntaxKind.ClassDeclaration:
                    component.kind = "class"
                    break
                case ts.SyntaxKind.InterfaceDeclaration:
                    component.kind = "interface"
                    break
                case ts.SyntaxKind.ImportDeclaration:
                    importations.push(getImportation(node))
                    break
                case ts.SyntaxKind.Parameter:
                    component.kind = "parameter"
                    component.type = getType(node)
                    break
                case ts.SyntaxKind.PropertySignature:
                case ts.SyntaxKind.PropertyDeclaration:
                    component.kind = "property"
                    component.type = getType(node)
                    break
                case ts.SyntaxKind.ExportAssignment:
                case ts.SyntaxKind.ExportDeclaration:
                case ts.SyntaxKind.ExportSpecifier:
                    // printRecursiveFrom(node, 0)
                    break
                default:
                    node.forEachChild(delintNode)
            }

            if (["function", "class", "interface", "method"].includes(component.kind)) {
                namespaces.push(getIdentifier(node))
                node.forEachChild(delintNode)
                namespaces.pop()
            }

            if (component.kind !== "") {
                component.identifier = getIdentifier(node)
                component.exported = isExported(node)
                component.defineGlobalIdentifier()
                components.push(component)
            }
        }
        ts.forEachChild(this.sourceFile, delintNode)
        return [components, importations]
    }
}

export { Parser }