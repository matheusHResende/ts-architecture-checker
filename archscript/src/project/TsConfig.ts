interface CompilerOptions {
    incremental?: boolean,                              /* Enable incremental compilation */
    composite?: boolean,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    tsBuildInfoFile?: string,                           /* Specify the folder for .tsbuildinfo incremental compilation files. */
    disableSourceOfProjectReferenceRedirect?: boolean,  /* Disable preferring source files instead of declaration files when referencing composite projects */
    disableSolutionSearching?: boolean,                 /* Opt a project out of multi-project reference checking when editing. */
    disableReferencedProjectLoad?: boolean,             /* Reduce the number of projects loaded automatically by TypeScript. */
    /* Language and Environment */
    target?: string,                                    /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    lib?: string[],                                     /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    jsx?: string,                                       /* Specify what JSX code is generated. */
    experimentalDecorators?: boolean,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    emitDecoratorMetadata?: boolean,                    /* Emit design-type metadata for decorated declarations in source files. */
    jsxFactory?: string,                                /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h' */
    jsxFragmentFactory?: string,                        /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    jsxImportSource?: string,                           /* Specify module specifier used to import the JSX factory functions when using `jsx?: react-jsx*`.` */
    reactNamespace?: string,                            /* Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit. */
    noLib?: boolean,                                    /* Disable including any library files, including the default lib.d.ts. */
    useDefineForClassFields?: boolean,                  /* Emit ECMAScript-standard-compliant class fields. */
    /* Modules */
    module?: string,                                    /* Specify what module code is generated. */
    rootDir?: string,                                   /* Specify the root folder within your source files. */
    moduleResolution?: string,                          /* Specify how TypeScript looks up a file from a given module specifier. */
    baseUrl?: string,                                   /* Specify the base directory to resolve non-relative module names. */
    paths?: object,                                     /* Specify a set of entries that re-map imports to additional lookup locations. */
    rootDirs?: string[],                                /* Allow multiple folders to be treated as one when resolving modules. */
    typeRoots?: string[],                               /* Specify multiple folders that act like `./node_modules/@types`. */
    types?: string[],                                   /* Specify type package names to be included without being referenced in a source file. */
    allowUmdGlobalAccess?: boolean,                     /* Allow accessing UMD globals from modules. */
    resolveJsonModule?: boolean,                        /* Enable importing .json files */
    noResolve?: boolean,                                /* Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project. */
    /* JavaScript Support */
    allowJs?: boolean,                                  /* Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files. */
    checkJs?: boolean,                                  /* Enable error reporting in type-checked JavaScript files. */
    maxNodeModuleJsDepth?: 1,                           /* Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with `allowJs`. */
    /* Emit */
    declaration?: boolean,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    declarationMap?: boolean,                           /* Create sourcemaps for d.ts files. */
    emitDeclarationOnly?: boolean,                      /* Only output d.ts files and not JavaScript files. */
    sourceMap?: boolean,                                /* Create source map files for emitted JavaScript files. */
    outFile?: string,                                   /* Specify a file that bundles all outputs into one JavaScript file. If `declaration` is boolean, also designates a file that bundles all .d.ts output. */
    outDir?: string,                                    /* Specify an output folder for all emitted files. */
    removeComments?: boolean,                           /* Disable emitting comments. */
    noEmit?: boolean,                                   /* Disable emitting files from a compilation. */
    importHelpers?: boolean,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    importsNotUsedAsValues?: string,                    /* Specify emit/checking behavior for imports that are only used for types */
    downlevelIteration?: boolean,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    sourceRoot?: string,                                /* Specify the root path for debuggers to find the reference source code. */
    mapRoot?: string,                                   /* Specify the location where debugger should locate map files instead of generated locations. */
    inlineSourceMap?: boolean,                          /* Include sourcemap files inside the emitted JavaScript. */
    inlineSources?: boolean,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    emitBOM?: boolean,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    newLine?: string,                                   /* Set the newline character for emitting files. */
    stripInternal?: boolean,                            /* Disable emitting declarations that have `@internal` in their JSDoc comments. */
    noEmitHelpers?: boolean,                            /* Disable generating custom helper functions like `__extends` in compiled output. */
    noEmitOnError?: boolean,                            /* Disable emitting files if any type checking errors are reported. */
    preserveConstEnums?: boolean,                       /* Disable erasing `const enum` declarations in generated code. */
    declarationDir?: string,                            /* Specify the output directory for generated declaration files. */
    preserveValueImports?: boolean,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */
    /* Interop Constraints */
    isolatedModules?: boolean,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    allowSyntheticDefaultImports?: boolean,             /* Allow 'import x from y' when a module doesn't have a default export. */
    esModuleInterop?: boolean,                          /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */
    preserveSymlinks?: boolean,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    forceConsistentCasingInFileNames?: boolean,         /* Ensure that casing is correct in imports. */
    /* Type Checking */
    strict?: boolean,                                   /* Enable all strict type-checking options. */
    noImplicitAny?: boolean,                            /* Enable error reporting for expressions and declarations with an implied `any` type.. */
    strictNullChecks?: boolean,                         /* When type checking, take into account `null` and `undefined`. */
    strictFunctionTypes?: boolean,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    strictBindCallApply?: boolean,                      /* Check that the arguments for `bind`, `call`, and `apply` methods match the original function. */
    strictPropertyInitialization?: boolean,             /* Check for class properties that are declared but not set in the constructor. */
    noImplicitThis?: boolean,                           /* Enable error reporting when `this` is given the type `any`. */
    useUnknownInCatchVariables?: boolean,               /* Type catch clause variables as 'unknown' instead of 'any'. */
    alwaysStrict?: boolean,                             /* Ensure 'use strict' is always emitted. */
    noUnusedLocals?: boolean,                           /* Enable error reporting when a local variables aren't read. */
    noUnusedParameters?: boolean,                       /* Raise an error when a function parameter isn't read */
    exactOptionalPropertyTypes?: boolean,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    noImplicitReturns?: boolean,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    noFallthroughCasesInSwitch?: boolean,               /* Enable error reporting for fallthrough cases in switch statements. */
    noUncheckedIndexedAccess?: boolean,                 /* Include 'undefined' in index signature results */
    noImplicitOverride?: boolean,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    noPropertyAccessFromIndexSignature?: boolean,       /* Enforces using indexed accessors for keys declared using an indexed type */
    allowUnusedLabels?: boolean,                        /* Disable error reporting for unused labels. */
    allowUnreachableCode?: boolean,                     /* Disable error reporting for unreachable code. */
    /* Completeness */
    skipDefaultLibCheck?: boolean,                      /* Skip type checking .d.ts files that are included with TypeScript. */
}

export interface TsConfig {
    compilerOptions?: CompilerOptions
}