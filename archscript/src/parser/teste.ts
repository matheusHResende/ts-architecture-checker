import * as ts from "typescript";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();
    let typeChecker = program.getTypeChecker()

    let sourceFiles = program.getSourceFiles()
    sourceFiles = sourceFiles.filter(file => !file.fileName.includes("/node_modules"))
    sourceFiles.forEach(file => {
        let fileSymbol = typeChecker.getSymbolAtLocation(file);
        console.log("############################################")
        console.log(fileSymbol?.escapedName)
        if (fileSymbol) {
            console.log("Root Symbols")
            // rootSymbols.forEach(symbol => console.log("\t", symbol.escapedName))
        }
        console.log("Members")
        fileSymbol?.members?.forEach(member => console.log("\t", member.escapedName))
        console.log("Exports")
        fileSymbol?.exports?.forEach(member => console.log("\t", member.escapedName))
        console.log("Global Exports")
        fileSymbol?.globalExports?.forEach(member => console.log("\t", member.escapedName))
        console.log("############################################")
    })

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}

compile(process.argv.slice(2), {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    lib: ['es2022'],
    downlevelIteration: true
});