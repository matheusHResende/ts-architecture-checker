import { lstatSync, readdirSync, writeFileSync, existsSync } from "fs"
import { resolve, sep } from "path"

function getFiles(path: string): Array<string> {
    const filesAndDirs = readdirSync(path)
    let files: Array<string> = []

    for (const file in filesAndDirs) {
        const subPath = `${path}${sep}${filesAndDirs[file]}`
        if (subPath.endsWith("node_modules")) continue
        if (lstatSync(subPath).isDirectory()) {
            files.push(...getFiles(subPath))
        }
        else {
            files.push(subPath)
        }
    }
    return files.map(file => toAbsolute(file))
}

function toAbsolute(path: string): string {
    return resolve(path)
}

function makeAbsolute(newReference: string, files: string[]): string[] {
    let path: string[] = []
    if (lstatSync(newReference).isFile()) {
        path = newReference.split(sep)
        path.pop()
    }
    return files.map(file => resolve(path.join(sep), file))
}

export function writeJSON(object: Object, fileName: string) {
    writeFileSync(fileName, JSON.stringify(object, null, 2), "utf-8")
}

export function existFile(filePath: string): boolean {
    return existsSync(filePath)
}

export { getFiles, toAbsolute, makeAbsolute }